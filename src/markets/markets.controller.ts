import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Request,
  Res,
  HttpStatus,
  Query,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { SaveShoesDto } from './dto/save-shoes.dto';

@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  //신발 데이터 요청
  // @Post('shoes/save')
  // async shoeList(@Body() saveShoesDto: SaveShoesDto, @Res() res) {
  //   await this.marketsService.fetchSneakers(saveShoesDto);
  //   res
  //     .status(HttpStatus.CREATED)
  //     .send({ message: '데이터 저장이 완료되었습니다.' });
  // }

  @Get()
  async getAllShoes(@Query('page') page: string) {
    return await this.marketsService.getAllShoes(page);
  }
}
