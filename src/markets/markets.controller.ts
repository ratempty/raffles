import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/create-market.dto';
import { AuthGuard } from '@nestjs/passport';
import { UpdateMarketDto } from './dto/update-market.dto';
import { UserInfo } from 'src/users/utils/userInfo.decorator';
import { User } from 'src/users/entities/user.entity';
import { S3Service } from 'src/s3/s3.service';
import { FilesInterceptor } from '@nestjs/platform-express';

@Controller('markets')
export class MarketsController {
  constructor(
    private readonly marketsService: MarketsService,
    private readonly s3Service: S3Service,
  ) {}

  //신발 데이터 요청
  // @Post('shoes/save')
  // async shoeList(@Body() saveShoesDto: SaveShoesDto, @Res() res) {
  //   await this.marketsService.fetchSneakers(saveShoesDto);
  //   return { message: '데이터 저장이 완료되었습니다.' };
  // }

  @Get()
  async getAllShoes(@Query('page') page: string) {
    return await this.marketsService.getAllShoes(page);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':shoesId')
  @UseInterceptors(FilesInterceptor('imgUrl', 5))
  async createMarket(
    @Body() createMarketDto: CreateMarketDto,
    @UploadedFiles() files: Express.Multer.File[],
    @UserInfo() user: User,
    @Param('shoesId') shoesId: string,
  ) {
    const imgurl = [];
    await Promise.all(
      files.map(async (file: Express.Multer.File) => {
        const key = await this.s3Service.uploadImage(file);
        imgurl.push(key);
      }),
    );
    await this.marketsService.createMarket(
      user.id,
      +shoesId,
      createMarketDto,
      imgurl,
    );
    return { message: '판매글이 작성되었습니다.' };
  }

  @Get(':shoesId')
  async findAllMarket(@Param('shoesId') shoesId: string) {
    return await this.marketsService.findAllMarket(+shoesId);
  }

  @Get('/shoes/:marketId')
  async findOneMarket(@Param('marketId') marketId: string) {
    return await this.marketsService.findOneMarket(+marketId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('/shoes/:marketId')
  async updateMarket(
    @Body() updateMarketDto: UpdateMarketDto,
    @UserInfo() user: User,
    @Param('marketId') marketId: string,
  ) {
    await this.marketsService.updateMarket(user.id, +marketId, updateMarketDto);
    return { message: '판매글이 수정되었습니다.' };
  }

  @UseGuards(AuthGuard('jwt'))
  @Delete('/shoes/:marketId')
  async deleteMarket(
    @Param('marketId') marketId: string,
    @UserInfo() user: User,
  ) {
    await this.marketsService.deleteMarket(user.id, +marketId);
    return { message: '판매글이 삭제되었습니다.' };
  }
}
