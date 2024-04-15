import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';

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
}
