import { Module } from '@nestjs/common';
import { RafflesService } from './raffles.service';
import { RafflesController } from './raffles.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Raffle } from './entities/raffle.entity';
import { UserRaffle } from './entities/userRaffle.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Raffle, UserRaffle])],
  providers: [RafflesService],
  controllers: [RafflesController],
})
export class RafflesModule {}
