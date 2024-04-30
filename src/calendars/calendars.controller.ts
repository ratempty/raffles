import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CalendarService } from './calendars.service';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { Calendar } from './entities/calendar.entity';
import { UserService } from 'src/users/users.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('calendars')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly userService: UserService,
  ) {}

  //메모작성
  @UseGuards(AuthGuard('jwt'))
  @Post()
  create(@Body() createCalendarDto: Calendar): Promise<Calendar> {
    return this.calendarService.create(
      createCalendarDto.memo,
      createCalendarDto.memoDate,
      createCalendarDto.userId,
    );
  }
  //메모전체조회
  @UseGuards(AuthGuard('jwt'))
  @Get()
  findAll(): Promise<Calendar[]> {
    return this.calendarService.findAll();
  }
  //메모상세조회
  @UseGuards(AuthGuard('jwt'))
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number): Promise<Calendar> {
    return this.calendarService.findOne(id);
  }
  //메모수정
  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ): Promise<Calendar> {
    return this.calendarService.update(id, updateCalendarDto);
  }
  //메모삭제
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  delete(@Param('id', ParseIntPipe) id: number): Promise<void> {
    return this.calendarService.delete(id);
  }
}
