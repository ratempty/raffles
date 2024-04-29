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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { AuthGuard } from '@nestjs/passport';

import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
  @UseGuards(AuthGuard('jwt'))
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  async logout(@Res({ passthrough: true }) res: Response) {
    // 현재 시간을 기준으로 쿠키 만료 시간을 설정
    res.cookie('Authorization', '', {
      httpOnly: true,
      expires: new Date(Date.now() - 1), // 현재 시간보다 1밀리초 이전으로 설정
    });
    return { message: '성공적으로 로그아웃되었습니다.' };
  }

  //회원탈퇴
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  async remove(@Param('id') id: number) {
    await this.userService.deleteUser(id);
  }
}
