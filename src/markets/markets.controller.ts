import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { MarketsService } from './markets.service';
import { CreateMarketDto } from './dto/create-market.dto';

@Controller('markets')
export class MarketsController {
  constructor(private readonly marketsService: MarketsService) {}
}
