import { Repository } from 'typeorm';

import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import axios from 'axios';

import { Raffle } from './entities/raffle.entity';
import { UserRaffle } from './entities/userRaffle.entity';

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,

    @InjectRepository(UserRaffle)
    private userRaffleRepository: Repository<UserRaffle>,
  ) {}

  arr = [];
  info = [];
  productIdArr = [];

  // 전체 응모 정보 조회
  async getRaffles() {
    const today = new Date();
    const startOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      0,
      0,
      0,
    );
    const endOfToday = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      23,
      59,
      59,
    );

    const todayRaffles = await this.raffleRepository
      .createQueryBuilder('raffle')
      .where(
        '(raffle.raffleStartDate IS NULL OR raffle.raffleStartDate < :endOfToday) AND raffle.raffleEndDate > :startOfToday',
        { startOfToday, endOfToday },
      )
      .getMany();

    const raffles = todayRaffles.map((todayRaffle) => ({
      subName: todayRaffle.subName,
      brand: todayRaffle.brand,
      imgUrl: todayRaffle.imgUrl,
      shoeCode: todayRaffle.shoeCode,
    }));

    return raffles;
  }

  // 응모 상세 정보 조회
  async getRaffle(shoeCode: string) {
    const raffles = await this.raffleRepository.findBy({
      shoeCode: shoeCode,
    });

    return raffles;
  }

  // 응모 참여 여부 (참여) = userRaffle 생성
  async makeUserRaffle(raffleId: number, userId: number) {
    const isExistUserRaffle = await this.userRaffleRepository.findBy({
      userId,
      raffleId,
    });

    if (isExistUserRaffle) {
      // 이거 탈 경우가 있나? 어차피 프론트에서 실행 못시키게 할거같은데
      throw new ConflictException('이미 참여한 응모입니다.');
    }

    const userRaffle = await this.userRaffleRepository.save({
      userId: userId,
      raffleId: raffleId,
    });

    return userRaffle;
  }

  // 응모 참여 여부 (참여) = userRaffle 삭제
  async deleteUserRaffle(raffleId: number, userId: number) {
    const existUserRaffle = await this.userRaffleRepository.findBy({
      userId,
      raffleId,
    });

    if (!existUserRaffle) {
      // 이거 탈 경우가 있나? 어차피 프론트에서 실행 못시키게 할거같은데
      throw new NotFoundException('참여한 응모가 아닙니다.');
    }

    await this.userRaffleRepository.delete({
      userId: userId,
      raffleId: raffleId,
    });
  }

  // 스크래핑
  async scrapUrl() {
    const headers = {
      accept: '*/*',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      referer: 'https://www.shoeprize.com/discover/',
      'sec-ch-ua':
        '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    };

    const today = new Date();
    today.setDate(today.getDate());
    const formatDate = today.toISOString().slice(0, 10).replace(/-/g, '');

    const params = {
      page: 1,
      page_size: 50,
      is_end: false,
      ordering: 'end_time,-id',
      type: 1,
      released_date: formatDate,
    };

    try {
      const response = await axios.get(
        'https://www.shoeprize.com/api/v2/releases/',
        { headers, params },
      );
      const result = response.data.results;

      for (let i = 0; i < result.length; i++) {
        let productId = result[i].product.id;
        this.productIdArr.push(productId);
      }
      return this.productIdArr;
    } catch (error) {
      console.error(error);
      throw error;
    }
  }

  async scrapInfo() {
    const headers = {
      accept: '*/*',
      'accept-language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'content-type': 'application/json',
      referer: 'https://www.shoeprize.com/raffles/404933/',
      'sec-ch-ua':
        '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"Windows"',
      'sec-fetch-dest': 'empty',
      'sec-fetch-mode': 'cors',
      'sec-fetch-site': 'same-origin',
      'user-agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
    };

    const productInfos = [];

    for (let i = 0; i < this.productIdArr.length; i++) {
      const params = {
        page: 1,
        page_size: 50,
        is_end: false,
        ordering: 'end_time,-id',
        product_id: this.productIdArr[i],
      };

      try {
        const response = await axios.get(
          'https://www.shoeprize.com/api/v2/releases/',
          { headers, params },
        );

        const result = response.data.results;

        const filterInfo = result.filter((raffle) => {
          const need =
            raffle.method !== '온라인 선착순' &&
            raffle.method !== '오프라인 선착순';
          return need;
        });

        const needInfo = filterInfo.map((raffle) => ({
          name: raffle.product.nameEn,
          subName: raffle.product.name,
          shoeCode: raffle.product.code,
          brand: raffle.product.brandName,
          relPrice: raffle.price,
          imgUrl: raffle.product.thumb,
          raffleStartDate: raffle.startTimestamp
            ? new Date(parseInt(raffle.startTimestamp))
                .toISOString()
                .slice(0, 19)
                .replace('T', ' ')
            : null,
          raffleEndDate: new Date(parseInt(raffle.endTimestamp))
            .toISOString()
            .slice(0, 19)
            .replace('T', ' '),
          raffleUrl: raffle.url,
        }));

        productInfos.push(needInfo);
      } catch (error) {
        console.error(error);
        throw error;
      }
    }

    for (let i = 0; i < productInfos.length; i++) {
      try {
        for (let infos of productInfos[i]) {
          await this.raffleRepository.save(infos);
        }
      } catch (error) {
        console.log('count', i);
        console.log('catchError :', error);
      }
    }
    return productInfos;
  }
}
