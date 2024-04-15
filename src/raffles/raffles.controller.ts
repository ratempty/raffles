import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  Delete,
} from '@nestjs/common';
import { RafflesService } from './raffles.service';

import { AuthGuard } from '@nestjs/passport';
import { User } from 'src/users/entities/user.entity';
import { UserInfo } from 'src/users/utils/userInfo.decorator';
import { Cron } from '@nestjs/schedule';

@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  // 오늘날짜 모든 응모정보 조회
  @Get()
  async getRaffles() {
    return await this.rafflesService.getRaffles();
  }

  // 스크래핑 api
  @Cron('0 0 0 * * *')
  @Get('/axios')
  async scrapRaffles() {
    return this.rafflesService.raffleScrap();
  }

  // @Get('/axios/url')
  // async geturl() {
  //   return this.rafflesService.scrapUrl();
  // }

  // @Get('/axios/info')
  // async getinfos() {
  //   return this.rafflesService.scrapInfo();
  // }

  // 내가 참여한 응모 정보 가져오기
  @UseGuards(AuthGuard('jwt'))
  @Get('/userRaffle')
  async getUserRaffle(@UserInfo() user: User) {
    console.log('controller');
    return await this.rafflesService.getUserRaffle(user.id);
  }

  // 모든 응모 정보에서 하나 클릭하면 상세 조회
  @Get('/:shoeCode')
  async getRaffle(@Param('shoeCode') shoeCode: string) {
    return await this.rafflesService.getRaffle(shoeCode);
  }

  // 응모 참여 여부 = userRaffle 생성
  @UseGuards(AuthGuard('jwt'))
  @Post('/:raffleId')
  async makeUserRaffle(
    @Param('raffleId') raffleId: number,
    @UserInfo() user: User,
  ) {
    await this.rafflesService.makeUserRaffle(raffleId, user.id);
    return { message: '참여 완료했습니다.' };
  }

  // 응모 참여 여부 = userRaffle 삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete('/:raffleId')
  async deleteUserRaffle(
    @Param('raffleId') raffleId: number,
    @UserInfo() user: User,
  ) {
    await this.rafflesService.deleteUserRaffle(raffleId, user.id);
    return { message: '참여 취소했습니다.' };
  }
}
