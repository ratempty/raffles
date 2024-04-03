import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { CreateRaffleDto } from './dto/create-raffle.dto';

@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}

  // 스크래핑 api 나중에 옮길것
  @Get('/axios')
  async getdata() {
    return this.rafflesService.scrapPage();
  }

  @Get('/axios/info')
  async getinfos() {
    return this.rafflesService.scrapInfo();
  }

  @Get('/puppeteer')
  async find() {
    return this.rafflesService.goScrap();
  }

  @Get('/puppeteer/info')
  async find1() {
    return this.rafflesService.raffleInfo();
  }
}
