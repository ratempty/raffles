import { Repository } from 'typeorm';

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import puppeteer from 'puppeteer';
import axios from 'axios';

import { Raffle } from './entities/raffle.entity';

@Injectable()
export class RafflesService {
  constructor(
    @InjectRepository(Raffle)
    private raffleRepository: Repository<Raffle>,
  ) {}

  arr = [];
  info = [];
  productIdArr = [];

  async scrapPage() {
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

    const params = {
      page: 1,
      page_size: 50,
      is_end: false,
      ordering: 'end_time,-id',
      type: 1,
      released_date: '20240403',
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
          const need = raffle.method !== '온라인 선착순';
          return need;
        });

        const needInfo = filterInfo.map((raffle) => ({
          name: raffle.product.nameEn,
          subName: raffle.product.name,
          shoeCode: raffle.product.code,
          brand: raffle.product.brandName,
          relPrice: raffle.price,
          imgUrl: raffle.product.thumb,
          raffleStartDate: parseInt(raffle.startTimestamp),
          raffleEndDate: parseInt(raffle.endTimestamp),
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

  async goScrap() {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      await page.goto('https://www.shoeprize.com/discover/');

      await page.evaluate(() => {
        localStorage.setItem(
          'discover_filter',
          '{"shortcut":"all","detail":{"selectOrder":"신상품순","order":"마감순","brand":[],"onoffline":[],"release":["응모"],"delivery":[],"region":[]}}',
        );
      });
      await page.reload();

      async function autoScroll(page) {
        await page.evaluate(async () => {
          await new Promise((resolve, reject) => {
            let totalHeight = 0;
            const distance = 300;
            const scrollInterval = setInterval(() => {
              const scrollHeight = document.body.scrollHeight;
              window.scrollBy(0, distance);
              totalHeight += distance;
              if (totalHeight >= scrollHeight) {
                clearInterval(scrollInterval);
                resolve(void 0);
              }
            }, 100);
          });
        });
      }
      await autoScroll(page);

      await new Promise((resolve) => setTimeout(resolve, 3000));

      const infos = await page.$$eval('.product_list li', (elements) =>
        elements.map((element) => {
          const curr = element.querySelector('a').getAttribute('href');
          return curr;
        }),
      );
      this.arr = infos;

      await page.close();
      await browser.close();

      return this.arr;
    } catch (error) {
      console.log(error);
      return error;
    }
  }

  async raffleInfo() {
    try {
      const browser = await puppeteer.launch({ headless: false });
      const page = await browser.newPage();
      const chunkSize = 10;

      for (let j = 0; j < this.arr.length; j += chunkSize) {
        const chunk = this.arr.slice(j, j + chunkSize);

        for (let i = 0; i < chunk.length; i++) {
          const url = 'https://www.shoeprize.com' + chunk[i];

          await page.goto(url);

          const brandText = await page.evaluate(() => {
            const brand = document.querySelector('.brand_info .brand');
            const name = document.querySelector('.brand_info .name');
            const subName = document.querySelector('.brand_info .detail');
            const shoeCode = document.querySelector('.info_list .text button');
            const relPrice = document.querySelectorAll(
              '.info_list span.text',
            )[1];
            return {
              brand: brand.textContent.trim(),
              name: name.textContent.trim(),
              subName: subName.textContent.trim(),
              shoeCode: shoeCode.textContent.trim(),
              relPrice: relPrice.textContent.trim(),
            };
          });

          this.info.push(brandText);
        }
      }

      await page.close();
      await browser.close();

      return this.info;
    } catch (error) {
      console.log(error);
    }
  }
}
