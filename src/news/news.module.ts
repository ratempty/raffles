import { Module } from '@nestjs/common';
import { NewsService } from './news.service';
import { NewsController } from './news.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { News } from './entities/news.entity';
import { SearchService } from 'src/search/search.service';
import { SearchModule } from 'src/search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([News]), SearchModule],
  controllers: [NewsController],
  providers: [NewsService],
})
export class NewsModule {}
