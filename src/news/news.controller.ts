import { Controller, Get, Param, Query } from '@nestjs/common';
import { NewsService } from './news.service';
import { CreateNewsDto } from './dto/create-news.dto';

@Controller('news')
export class NewsController {
  constructor(private readonly newsService: NewsService) {}

  @Get('footwear')
  async getHTML() {
    return this.newsService.getHTML();
  }

  @Get('scrapeAll')
  async scrapeAll() {
    return this.newsService.scrapeAll();
  }

  @Get()
  async findAllNews() {
    return this.newsService.findAllNews();
  }

  @Get(':id')
  async findOneNews(@Param('id') id: number) {
    await this.newsService.viewCount(id);
    return this.newsService.findOneNews(id);
  }

  @Get()
  async findNews(@Query('type') type: string) {
    if (type === 'popular') {
      return this.newsService.findPopularNews();
    } else if (type === 'latest') {
      return this.newsService.findLatestNews();
    } else {
      return this.newsService.findAllNews();
    }
  }
}
