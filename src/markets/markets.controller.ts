import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  HttpStatus,
  Query,
  UseGuards,
  Req,
  Request,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { SaveShoesDto } from './dto/save-shoes.dto';
import { CreateMarketDto } from './dto/create-market.dto';
import { AuthGuard } from '@nestjs/passport';

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

  //@UseGuards(AuthGuard('jwt'))
  @Post(':shoeId')
  async createPost(
    @Body() createMarketDto: CreateMarketDto,
    @Request() req,
    @Param('shoeId') shoeId: string,
    @Res() res,
  ) {
    //const userId = req.user.id;
    await this.marketsService.createPost(+shoeId, createMarketDto);
    res
      .status(HttpStatus.CREATED)
      .send({ message: '판매글이 작성되었습니다.' });
  }
}
