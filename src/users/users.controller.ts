import { UserInfo } from './utils/userInfo.decorator';
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
  Header,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtGuard } from 'src/auth/guard';

@Controller('user')
export class UserController {
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
  //회원정보상세조회
  @UseGuards(AuthGuard('jwt'))
  @Get('profile/:id')
  async findByEmail(@Param('id') id: number): Promise<User> {
    return await this.userService.findOne(id);
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

  //카카오 로그인 로직 - 인가 코드 받는 부분
  @Get('/oauth')
  @Header('Content-Type', 'text/html')
  redirectToKakaoAuth(@Res() res) {
    const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
    const kakaoAuthURL = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}`;
    res.redirect(HttpStatus.TEMPORARY_REDIRECT, kakaoAuthURL);
  }
  // 사용자 정보 불러오는 로직
  @Get('/oauth/kakao-auth')
  async getKakaoInfo(@Query() query: { code }) {
    const KAKAO_REST_API_KEY = process.env.KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = process.env.KAKAO_REDIRECT_URI;
    await this.userService.kakaoLogin(
      KAKAO_REST_API_KEY,
      KAKAO_REDIRECT_URI,
      query.code,
    );
    return { message: '카카오 로그인 되었습니다' };
  }

  // 사용자 응모내역 조회
  // @Get(':userId/entries')
  // async getUserRaffleEntries(@Param('userId') userId: number) {
  //   const userRaffles = await this.userRaffleRepository.find({
  //     where: { userId },
  //     relations: ['raffle'],
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
  // }
}
