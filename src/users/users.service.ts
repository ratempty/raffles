import { compare, hash } from 'bcrypt';
import _ from 'lodash';
import { Repository } from 'typeorm';

import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';

import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // 회원가입 메소드
  async register(
    email: string,
    password: string,
    passwordConfirm: string,
    nickName: string,
    name: string,
  ) {
    // 이메일로 이미 가입된 사용자가 있는지 확인
    const existingUser = await this.findByEmail(email);
    if (existingUser) {
      throw new ConflictException(
        '이미 해당 이메일로 가입된 사용자가 있습니다!',
      );
    }

    // 비밀번호와 비밀번호 확인이 일치하는지 확인
    if (password !== passwordConfirm) {
      throw new BadRequestException(
        '비밀번호와 비밀번호 확인이 일치하지 않습니다.',
      );
    }

    // 비밀번호 해싱
    const hashedPassword = await hash(password, 10);

    // 사용자 정보 저장
    await this.userRepository.save({
      email,
      password: hashedPassword,
      nickName: nickName,
      name,
    });
  }

  // 로그인 메소드
  async login(email: string, password: string) {
    // 이메일로 사용자를 찾음
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });
    if (_.isNil(user)) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    // 비밀번호 확인
    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    // Access Token 및 Refresh Token 생성
    const accessTokenPayload = { email, sub: user.id, token_type: 'access' };
    const refreshTokenPayload = { email, sub: user.id, token_type: 'refresh' };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: '15m',
    }); // Access Token의 유효기간은 15분
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
    }); // Refresh Token의 유효기간은 7일

    return {
      userId: user.id,
      message: '로그인 되었습니다',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 이메일로 사용자 찾기 메소드
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  // ID로 사용자 찾기 메소드
  async findOne(id: number) {
    const users = await this.userRepository.findOneBy({ id });
    if (_.isNil(users)) {
      throw new NotFoundException('해당 유저가 없습니다');
    }
    return users;
  }

  // 전체 회원 조회 메소드
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 회원 정보 수정 메소드
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    // 사용자 정보 업데이트
    await this.userRepository.update(
      { id },
      {
        email: updateUserDto.email,
        name: updateUserDto.name,
        nickName: updateUserDto.nickName,
      },
    );

    return await this.userRepository.findOneBy({ id });
  }
  //로그아웃
  async logout(token: string) {
    if (!token) {
      throw new UnauthorizedException('로그아웃을 위한 토큰이 필요합니다.');
    }

    // 토큰 디코드하여 유효성 및 만료 시간 확인
    const decoded = this.jwtService.decode(token);
    if (!decoded || typeof decoded === 'string') {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    const userId = decoded.sub;

    const user = await this.userRepository.findOneBy({ id: userId });
    if (!user) {
      throw new NotFoundException('유저를 찾을 수 없습니다.');
    }
  }

  // 회원 삭제 메소드
  async deleteUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    await this.userRepository.delete({ id });
  }
}
