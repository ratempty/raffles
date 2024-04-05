import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Shoes } from './entities/shoes.entity';
import { Repository } from 'typeorm';
import { SaveShoesDto } from './dto/save-shoes.dto';
import { CreateMarketDto } from './dto/create-market.dto';
import { Market } from './entities/market.entity';
import { UpdateMarketDto } from './dto/update-market.dto';
import { SaleStatus } from './types/salesStatus.type';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Shoes)
    private shoesRepository: Repository<Shoes>,
    @InjectRepository(Market)
    private marketsRepository: Repository<Market>,
  ) {}
  async getAllShoes(page: string) {
    const skipShoeId = (+page - 1) * 50;
    const shoes = await this.shoesRepository.find({
      select: {
        id: true,
        name: true,
        brand: true,
        imgUrl: true,
      },
      skip: skipShoeId,
      take: 50,
    });
    const shoeImgOnlyThumbnail = shoes.map((shoe) => ({
      id: shoe.id,
      name: shoe.name,
      brand: shoe.brand,
      thumbUrl: shoe.imgUrl['thumbUrl'],
    }));
    return shoeImgOnlyThumbnail;
  }

  async createMarket(
    userId: number,
    shoeId: number,
    createMarketDto: CreateMarketDto,
  ) {
    const { title, content, size, imgUrl, salesStatus, price, useStatus } =
      createMarketDto;
    const view = 0;
    await this.marketsRepository.save({
      userId,
      shoeId,
      title,
      content,
      size,
      view,
      imgUrl,
      salesStatus,
      price,
      useStatus,
    });
  }

  async findAllMarket(shoesId: number) {
    const shoes = await this.shoesRepository.findOne({
      where: { id: shoesId },
      select: ['name', 'brand', 'shoeCode', 'imgUrl'],
    });

    const shoesInfo = {
      name: shoes.name,
      brand: shoes.brand,
      shooCode: shoes.shoeCode,
      imageUrl: shoes.imgUrl['imageUrl'],
    };
    console.log(shoesInfo);
    const posts = await this.marketsRepository.find({
      where: { shoesId },
      order: {
        saleStatus: 'ASC',
        view: 'DESC',
      },
    });
    return { shoesInfo, posts };
  }

  async findOneMarket(marketId: number) {
    const market = await this.marketsRepository.findOne({
      where: { id: marketId },
    });
    if (!market) {
      throw new NotFoundException({ message: '판매글이 존재하지 않습니다.' });
    }
    await this.marketsRepository.update(
      { id: market.id },
      { view: market.view + 1 },
    );
    const updateMarket = await this.marketsRepository.findOne({
      where: { id: marketId },
    });
    return updateMarket;
  }

  async updateMarket(
    userId: number,
    marketId: number,
    updateMarketDto: UpdateMarketDto,
  ) {
    const market = await this.findOneMarket(marketId);
    if (market.userId !== userId) {
      throw new UnauthorizedException({
        message: '판매글을 수정할 권한이 없습니다.',
      });
    }
    const updateData = updateMarketDto;
    if (!updateData) {
      throw new BadRequestException({ message: '수정할 내용을 입력해주세요.' });
    }
    await this.marketsRepository.update(
      {
        id: marketId,
      },
      updateData,
    );
  }

  async deleteMarket(userId: number, marketId: number) {
    const market = await this.findOneMarket(marketId);
    if (market.userId !== userId) {
      throw new UnauthorizedException({
        message: '판매글을 삭제할 권한이 없습니다.',
      });
    }
    await this.marketsRepository.delete({ id: marketId });
  }

  async SneakersApiCall(page: string, brand: string) {
    try {
      const response = await axios.get(
        'https://v1-sneakers.p.rapidapi.com/v1/sneakers',
        {
          params: {
            limit: '100',
            page: page,
            brand: brand,
          },
          headers: {
            'X-RapidAPI-Key': process.env.RAPIDAPI_KEY,
            'X-RapidAPI-Host': 'v1-sneakers.p.rapidapi.com',
          },
        },
      );
      return response.data;
    } catch (error) {
      throw new Error(`Failed to fetch sneakers data: ${error.message}`);
    }
  }

  async fetchSneakers(saveShoesDto: SaveShoesDto) {
    const { brand } = saveShoesDto;
    for (let i = 1; i <= 15; i++) {
      const page = i.toString();
      const sneakersData = await this.SneakersApiCall(page, brand);
      if (sneakersData.results.length === 0) {
        break;
      }
      const sneakersDataSave = sneakersData.results.map((sneakerData) => {
        const { brand, styleId, title, media } = sneakerData;
        if (media.imageUrl === null || styleId === '') {
          return null;
        } else {
          return { brand, shoeCode: styleId, name: title, imgUrl: media };
        }
      });
      await this.saveSneakers(sneakersDataSave);
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  async saveSneakers(sneakersDataSave: any[]) {
    const filterData = sneakersDataSave.filter((sneakers) => sneakers !== null);
    await this.shoesRepository.save(filterData);
  }
}
