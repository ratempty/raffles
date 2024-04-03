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
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { SaveShoesDto } from './dto/save-shoes.dto';

@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}

  @Post('shoes/save')
  async shoeList(@Body() saveShoesDto: SaveShoesDto, @Res() res) {
    await this.marketsService.fetchSneakers(saveShoesDto);
    res
      .status(HttpStatus.CREATED)
      .send({ message: '데이터 저장이 완료되었습니다.' });
  }
}
