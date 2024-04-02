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
import { UserRaffle } from 'src/raffles/entities/userRaffle.entity';
import { firstValueFrom } from 'rxjs';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    // @InjectRepository(UserRaffle) // UserRaffle 엔티티 Repository 주입
    // private userRaffleRepository: Repository<UserRaffle>,
    private readonly jwtService: JwtService,
    private http: HttpService,
  ) {}

  // 회원가입
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
      passwordConfirm: hashedPassword,
      nickName,
      name,
    });
  }
  // 로그인
  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      select: ['id', 'email', 'password'],
      where: { email },
    });
    if (_.isNil(user)) {
      throw new UnauthorizedException('이메일을 확인해주세요.');
    }

    if (!(await compare(password, user.password))) {
      throw new UnauthorizedException('비밀번호를 확인해주세요.');
    }

    const accessTokenPayload = { email, sub: user.id, token_type: 'access' };
    const refreshTokenPayload = { email, sub: user.id, token_type: 'refresh' };

    const accessToken = this.jwtService.sign(accessTokenPayload, {
      expiresIn: '15m',
    }); // Access Token의 유효기간은 15분
    const refreshToken = this.jwtService.sign(refreshTokenPayload, {
      expiresIn: '7d',
    }); // Refresh Token의 유효기간은 7일

    return {
      message: '로그인 되었습니다',
      access_token: accessToken,
      refresh_token: refreshToken,
    };
  }

  // 회원체크
  async findByEmail(email: string) {
    return await this.userRepository.findOneBy({ email });
  }

  async findOne(id: number) {
    const users = await this.userRepository.findOneBy({ id });
    if (_.isNil(users)) {
      throw new NotFoundException('해당 유저가 없습니다');
    }
    return users;
  }

  // 전체회원조회
  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  // 회원정보 수정
  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

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

  // 로그아웃
  async logout(token: string) {
    // 토큰의 만료 시간을 조정하여 로그아웃을 구현
    // 토큰의 만료 시간을 현재 시간으로 설정하여 무효화
    const expiredToken = this.jwtService.sign({}, { expiresIn: 0 });
    // 클라이언트에게 새로운 만료된 토큰을 전달하여 로그아웃을 유도
    // 클라이언트는 이 새로운 토큰을 사용하여 인증 요청을 할 경우 로그아웃 처리된다.
    return { access_token: expiredToken };
  }

  // 회원정보 탈퇴
  async deleteUser(id: number) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }
    await this.userRepository.delete({ id });
  }

  async kakaoLogin(
    KAKAO_REST_API_KEY: string,
    KAKAO_REDIRECT_URI: string,
    code: string,
  ) {
    const config = {
      grant_type: 'authorization_code',
      client_id: KAKAO_REST_API_KEY,
      redirect_uri: KAKAO_REDIRECT_URI,
      code,
    };

    const params = new URLSearchParams(config).toString();
    const tokenHeaders = {
      'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
    };
    const tokenUrl = `https://kauth.kakao.com/oauth/token?${params}`;
    const tokenRes = await firstValueFrom(
      this.http.post(tokenUrl, '', { headers: tokenHeaders }),
    );

    console.log('Token Response:', tokenRes.data);

    const accessToken = tokenRes.data.access_token;

    const userInfoUrl = `https://kapi.kakao.com/v2/user/me`;
    const userInfoHeaders = {
      Authorization: `Bearer ${accessToken}`,
    };

    const userInfoRes = await firstValueFrom(
      this.http.get(userInfoUrl, { headers: userInfoHeaders }),
    );

    console.log('User Info:', userInfoRes.data);

    const data = userInfoRes.data;

    // 사용자 정보를 로컬 DB에 저장
    let user = await this.userRepository.findOne({
      where: { kakaoId: data.id },
    });
    if (!user) {
      user = new User();
      user.kakaoId = data.id;
      // user.email = data.kakao_account.email; -카카오디벨롭 동의항목에 추가가 안되어있음.
      user.nickName = data.properties.nickname;
      // 기타 필요한 정보 추가 가능
      await this.userRepository.save(user);
    }

    return user;
  }
}
// 사용자의 응모 내역 조회
// async getUserRaffleEntries(userId: number) {
//   const userRaffles = await this.userRaffleRepository.find({
//     where: { userId },
//     relations: ['raffle'], // 응모 정보를 함께 로드하기 위해 관계 추가
//   });

//   if (!userRaffles || userRaffles.length === 0) {
//     throw new NotFoundException('사용자의 응모 내역을 찾을 수 없습니다.');
//   }

//   // 사용자의 응모 내역을 반환
//   return userRaffles.map((userRaffle) => ({
//     name: userRaffle.raffle.name,
//     imgUrl: userRaffle.raffle.imgUrl,
//     brand: userRaffle.raffle.brand,
//     shoeCode: userRaffle.raffle.shoeCode,
//     relPrice: userRaffle.raffle.relPrice,
//     raffleStartDate: userRaffle.raffle.raffleStartDate,
//     raffleEndDate: userRaffle.raffle.raffleEndDate,
//   }));
