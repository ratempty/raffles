import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  Put,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { index } from 'cheerio/lib/api/traversing';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(@Query('query') query: string) {
    try {
      const results = await this.searchService.search(query);
      return { data: results };
    } catch (error) {
      return { error: '검색이 되지 않았습니다.' };
    }
  }

  @Post('insertData')
  async insertData(@Body() data: { index: string; body: any }) {
    try {
      const { index, body } = data;
      const result = await this.searchService.insertData(index, body);
      console.log('리절트', result);
      return { success: true, result };
    } catch (error) {
      console.log('error message: ', error);
    }
  }
}
