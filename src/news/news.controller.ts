import { Controller, Get, Param, Query, Req } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';
import { Request } from 'express';
import { Cron } from '@nestjs/schedule';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Cron('0 */3 * * *') // 3시간마다 실행
  @Get('scrapeAll')
  async scrapeAll() {
    return await this.newsService.scrapeAll();
  }

  @Get()
  async findAllNews() {
    return await this.newsService.findAllNews();
  }

  @Get('find')
  async findNews(@Query('type') type: string) {
    if (type === 'popular') {
      return await this.newsService.findPopularNews();
    } else if (type === 'latest') {
      return await this.newsService.findLatestNews();
    } else {
      return await this.newsService.findAllNews();
    }
  }

  @Get(':id')
  async findOneNews(@Param('id') id: number) {
    await this.newsService.viewCount(id);
    return await this.newsService.findOneNews(id);
  }
}
