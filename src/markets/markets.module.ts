import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shoes } from './entities/shoes.entity';
import { Market } from './entities/market.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shoes, Market])],
  controllers: [MarketsController],
  providers: [MarketsService],
})
export class MarketsModule {}
