import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  Delete,
  UseGuards,
  Res,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from '../auth/guard';
import { UserInfo } from './utils/userInfo.decorator';

@Controller('user')
export class UserController {
  userRaffleRepository: any;
  constructor(
    private readonly userService: UserService,
    // private readonly userRaffleRepository: UserRaffleRepository,
  ) {}

  //회원가입
  @Post('register')
  async register(@Body() RegisterDto: RegisterDto) {
    return await this.userService.register(
      RegisterDto.email,
      RegisterDto.password,
      RegisterDto.passwordConfirm,
      RegisterDto.nickName,
      RegisterDto.name,
    );
  }
  //로그인
  @Post('login')
  async login(
    @Body() loginDto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const accessToken = await this.userService.login(
      loginDto.email,
      loginDto.password,
    );
    res.cookie('Authorization', accessToken.access_token, {
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 1000,
    });
    return accessToken;
  }
  // 회원 정보 상세 조회

  @UseGuards(AuthGuard('jwt'))
  @Get('profile/:id')
  async findByEmail(@Param('id') id: string): Promise<User> {
    // 그 외의 경우, 일반 사용자 ID로 조회
    return await this.userService.findOne(parseInt(id, 10));
  }
  //회원전체조회
  @Get()
  async findAll() {
    return await this.userService.findAll();
  }
  //회원정보수정
  @UseGuards(AuthGuard('jwt'))
  @Patch('profile/:id')
  async updateProfile(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<{ message: string; updatedUser: User }> {
    const updatedUser = await this.userService.updateUser(id, updateUserDto);
    if (!updatedUser) {
      throw new NotFoundException('사용자를 찾을 수 없습니다.');
    }

    return {
      message: '회원 정보가 수정되었습니다. 다시 로그인 해주세요.',
      updatedUser: updatedUser,
    };
  }
  //로그아웃
  @UseGuards(JwtGuard)
  @Post('logout')
  async logout(@Body('token') token: string) {
    if (!token) {
      throw new UnauthorizedException(
        '로그아웃을 위한 토큰이 제공되지 않았습니다.',
      );
    }
    await this.userService.logout(token);

    return { message: '로그아웃되었습니다.' };
  }
  //회원탈퇴
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }

  // 사용자 응모내역 조회
  @Get(':userId/entries')
  async getUserRaffleEntries(@Param('userId') userId: number) {
    const userRaffles = await this.userRaffleRepository.find({
      where: { userId },
      relations: ['raffle'],
    });

    if (!userRaffles || userRaffles.length === 0) {
      throw new NotFoundException('사용자의 응모 내역을 찾을 수 없습니다.');
    }

    // 사용자의 응모 내역을 반환
    return userRaffles.map((userRaffle) => ({
      name: userRaffle.raffle.name,
      imgUrl: userRaffle.raffle.imgUrl,
      brand: userRaffle.raffle.brand,
      shoeCode: userRaffle.raffle.shoeCode,
      relPrice: userRaffle.raffle.relPrice,
      raffleStartDate: userRaffle.raffle.raffleStartDate,
      raffleEndDate: userRaffle.raffle.raffleEndDate,
    }));
  }
}
