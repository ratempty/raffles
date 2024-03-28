import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';

@Controller('calendars')
export class CalendarsController {
  constructor(private readonly calendarsService: CalendarsService) {}
}
