import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RafflesService } from './raffles.service';

@Controller('raffles')
export class RafflesController {
  constructor(private readonly rafflesService: RafflesService) {}
}
