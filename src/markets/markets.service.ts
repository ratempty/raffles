import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Shoes } from './entities/shoes.entity';
import { Repository } from 'typeorm';
import { SaveShoesDto } from './dto/save-shoes.dto';
import { CreateMarketDto } from './dto/create-market.dto';
import { Market } from './entities/market.entity';
import { UpdateMarketDto } from './dto/update-market.dto';

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

    // const shoeImgOnlyThumnail = shoes.map((shoe) => ({
    //   id: shoe.id,
    //   name: shoe.name,
    //   imgUrl: shoe.imgUrl,
    // }));
    // console.log(shoeImgOnlyThumnail);
    return shoes;
  }

  async createPost(
    shoeId: number,
    {
      title,
      content,
      size,
      imgUrl,
      salesStatus,
      price,
      useStatus,
    }: CreateMarketDto,
  ) {
    const view = 0;
    const post = await this.marketsRepository.save({
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

  async findAllPost(shoesId: number) {
    const shoesInfo = await this.shoesRepository.findOne({
      where: { id: shoesId },
      select: ['brand', 'name', 'shoeCode', 'imgUrl'],
    });
    const posts = await this.marketsRepository.find({
      where: { shoesId },
    });
    return { shoesInfo, posts };
  }

  async findOnePost(marketId: number) {
    await this.marketsRepository.findOne({
      where: { id: marketId },
    });
  }

  async updatePost(marketId: number, updateMarketDto: UpdateMarketDto) {
    const updateData = updateMarketDto;
    await this.marketsRepository.update(
      {
        id: marketId,
      },
      updateData,
    );
  }

  async deleteMarket(marketId: number) {
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
