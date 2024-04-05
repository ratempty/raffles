import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule, TypeOrmModuleOptions } from '@nestjs/typeorm';
import { MarketsModule } from './markets/markets.module';
import { CalendarsModule } from './calendars/calendars.module';
import { NewsModule } from './news/news.module';
import { RafflesModule } from './raffles/raffles.module';
import Joi from 'joi';
import { User } from './users/entities/user.entity';
import { Market } from './markets/entities/market.entity';
import { News } from './news/entities/news.entity';
import { Raffle } from './raffles/entities/raffle.entity';
import { UserRaffle } from './raffles/entities/userRaffle.entity';
import { Calendar } from './calendars/entities/calendar.entity';
import { Shoes } from './markets/entities/shoes.entity';
import { ScheduleModule } from '@nestjs/schedule';

const typeOrmModuleOptions = {
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => ({
    type: 'mysql',
    username: configService.get('DB_USERNAME'),
    password: configService.get('DB_PASSWORD'),
    host: configService.get('DB_HOST'),
    port: configService.get('DB_PORT'),
    database: configService.get('DB_NAME'),
    entities: [User, Market, News, Raffle, UserRaffle, Calendar, Shoes],
    synchronize: configService.get('DB_SYNC'),
    logging: true,
  }),
  inject: [ConfigService],
};

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        JWT_SECRET_KEY: Joi.string().required(),
        DB_USERNAME: Joi.string().required(),
        DB_PASSWORD: Joi.string().required(),
        DB_HOST: Joi.string().required(),
        DB_PORT: Joi.number().required(),
        DB_NAME: Joi.string().required(),
        DB_SYNC: Joi.boolean().required(),
      }),
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    UsersModule,
    MarketsModule,
    CalendarsModule,
    NewsModule,
    RafflesModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
