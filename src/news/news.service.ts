import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { Repository } from 'typeorm';
import axios, { all } from 'axios';
import cheerioModule from 'cheerio';
import puppeteer from 'puppeteer';
import { SearchService } from 'src/search/search.service';

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(News)
    private newsRepository: Repository<News>,
    private readonly searchService: SearchService,
  ) {}
  async getHTML() {
    const options = {
      method: 'GET',
      url: 'https://hypebeast.kr/footwear',
      headers: {
        accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'accept-language':
          'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7,zh-TW;q=0.6,zh;q=0.5',
        referer: 'https://hypebeast.kr/',
        'sec-ch-ua':
          '"Google Chrome";v="123", "Not:A-Brand";v="8", "Chromium";v="123"',
        'sec-ch-ua-mobile': '?0',
        'sec-ch-ua-platform': '"Windows"',
        'sec-fetch-dest': 'document',
        'sec-fetch-mode': 'navigate',
        'sec-fetch-site': 'same-origin',
        'sec-fetch-user': '?1',
        'upgrade-insecure-requests': '1',
        'user-agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36',
      },
    };

    try {
      const response = await axios.request(options);
      const html = response.data;
      const $ = cheerioModule.load(html);

      const urls = [];
      $('.post-box').each(function () {
        const url = $(this).attr('data-permalink');
        urls.push(url);
      });

      console.log('URLs:', urls);

      return urls;
    } catch (error) {
      console.error('Error:', error);
      return null;
    }
  }

  async scrapeData(url: string) {
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { timeout: 60000 });
      const html = await page.content();
      const $ = cheerioModule.load(html);

      const title = $('.post-body-title').text().trim();
      const subTitle = $('.post-body-excerpt').text().trim();
      let content = $('.post-body-content').text().trim();
      const image = $('.carousel-cell-image').attr('src');

      await browser.close();
      content = content.split('더 보기')[0].trim();
      content = content.replace(/\s+/g, ' ');
      console.log({ title, subTitle, content, image });

      if (!title || !subTitle || !content || !image) {
        throw new BadRequestException();
      }

      const news = this.newsRepository.create({
        title,
        subTitle,
        content,
        newsImg: image,
        newsUrl: url,
      });
      await this.newsRepository.save(news);

      return { title, subTitle, content, image };
    } catch (error) {
      console.error('Error:', error);
    }
  }

  async scrapeAll() {
    const urls = await this.getHTML(); // getHTML() 메서드를 사용하여 URL을 가져옵니다.
    if (!urls) return null;

    const scrapedData = [];

    for (const url of urls) {
      const data = await this.scrapeData(url);
      if (data) {
        scrapedData.push(data);
      }
    }

    return scrapedData;
  }

  async findAllNews(): Promise<
    {
      id: number;
      title: string;
      subTitle: string;
      newsImg: string;
      views: number;
    }[]
  > {
    const news = await this.newsRepository.find();
    return news.map((item) => ({
      id: item.id,
      title: item.title,
      subTitle: item.subTitle,
      newsImg: item.newsImg,
      views: item.views,
    }));
  }

  async findOneNews(id: number): Promise<News> {
    return this.newsRepository.findOne({
      where: {
        id,
      },
    });
  }

  async viewCount(id: number) {
    const news = await this.newsRepository.findOne({
      where: {
        id,
      },
    });
    if (news) {
      news.views++;
      await this.newsRepository.save(news);
    }
  }

  async findPopularNews() {
    const popularNews = await this.newsRepository.find({
      order: {
        views: 'DESC',
        createdAt: 'DESC',
      },
      select: ['title', 'subTitle', 'newsImg', 'views'],
    });
    return popularNews;
  }

  async findLatestNews() {
    const latestNews = await this.newsRepository.find({
      order: {
        createdAt: 'DESC',
      },
      select: ['title', 'subTitle', 'newsImg', 'views'],
    });
    return latestNews;
  }
}
