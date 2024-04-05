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
import { CreateMarketDto } from './dto/create-market.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateMarketDto } from './dto/update-market.dto';
import { JwtGuard } from 'src/auth/guard';

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

  @UseGuards(JwtGuard)
  @Post(':shoeId')
  async createMarket(
    @Body() createMarketDto: CreateMarketDto,
    @Request() req,
    @Param('shoeId') shoeId: string,
    @Res() res,
  ) {
    const userId = req.user.id;
    await this.marketsService.createMarket(userId, +shoeId, createMarketDto);
    res
      .status(HttpStatus.CREATED)
      .send({ message: '판매글이 작성되었습니다.' });
  }

  @Get(':shoesId')
  async findAllMarket(@Param('shoesId') shoesId: string) {
    return await this.marketsService.findAllMarket(+shoesId);
  }

  @Get('/shoes/:marketId')
  async findOneMarket(@Param('marketId') marketId: string) {
    return await this.marketsService.findOneMarket(+marketId);
  }

  @UseGuards(JwtGuard)
  @Patch('/shoes/:marketId')
  async updateMarket(
    @Body() updateMarketDto: UpdateMarketDto,
    @Request() req,
    @Param('marketId') marketId: string,
    @Res() res,
  ) {
    const userId = req.user.id;
    await this.marketsService.updateMarket(userId, +marketId, updateMarketDto);
    res
      .status(HttpStatus.ACCEPTED)
      .send({ message: '판매글이 수정되었습니다.' });
  }

  @UseGuards(JwtGuard)
  @Delete('/shoes/:marketId')
  async deleteMarket(
    @Request() req,
    @Param('marketId') marketId: string,
    @Res() res,
  ) {
    const userId = req.user.id;
    await this.marketsService.deleteMarket(userId, +marketId);
    res
      .status(HttpStatus.ACCEPTED)
      .send({ message: '판매글이 삭제되었습니다.' });
  }
}
