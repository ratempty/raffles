import { Module } from '@nestjs/common';
import { MarketsService } from './markets.service';
import { MarketsController } from './markets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Shoes } from './entities/shoes.entity';
import { Market } from './entities/market.entity';
import { User } from 'src/users/entities/user.entity';
import { S3Service } from 'src/s3/s3.service';

@Module({
  imports: [TypeOrmModule.forFeature([Shoes, Market, User])],
  controllers: [MarketsController],
  providers: [MarketsService, S3Service],
})
export class MarketsModule {}
