import { Module } from '@nestjs/common';
import { CalendarService } from './calendars.service';
import { CalendarController } from './calendars.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Calendar } from './entities/calendar.entity';
import { User } from 'src/users/entities/user.entity';
import { UserService } from 'src/users/users.service';
import { JwtModule } from '@nestjs/jwt';
import { HttpModule } from '@nestjs/axios';
import { UserRaffle } from 'src/raffles/entities/userRaffle.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Calendar, User, UserRaffle]),
    JwtModule,
    HttpModule,
  ], // Calendar 엔티티를 사용할 수 있도록 TypeOrmModule의 forFeature() 메서드를 사용하여 임포트합니다.
  controllers: [CalendarController],
  providers: [CalendarService, UserService],
})
export class CalendarModule {}
