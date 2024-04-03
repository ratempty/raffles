import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import { Shoes } from './entities/shoes.entity';
import { Repository } from 'typeorm';
import { SaveShoesDto } from './dto/save-shoes.dto';

@Injectable()
export class MarketsService {
  constructor(
    @InjectRepository(Shoes)
    private shoesRepository: Repository<Shoes>,
  ) {}
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
    //for (let i = 1; i <= 15; i++) {
    //const page = i.toString();
    const page = '1';
    const sneakersData = await this.SneakersApiCall(page, brand);
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
    //}
  }

  async saveSneakers(sneakersDataSave: any[]) {
    const filterData = sneakersDataSave.filter((sneakers) => sneakers !== null);
    await this.shoesRepository.save(filterData);
  }
}
