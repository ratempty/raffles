import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { Calendar } from './entities/calendar.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class CalendarService {
  constructor(
    @InjectRepository(Calendar)
    private calendarRepository: Repository<Calendar>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(memo: string, memoDate: Date, id: number): Promise<Calendar> {
    // 사용자 인증 확인
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new UnauthorizedException('사용자를 찾을 수 없습니다.');
    }

    // 메모 생성
    const newMemo = this.calendarRepository.create({ memo, memoDate, user });
    return await this.calendarRepository.save(newMemo);
  }

  //메모전체조회
  async findAll(): Promise<Calendar[]> {
    return this.calendarRepository.find();
  }
  //메모상세조회
  async findOne(id: number): Promise<Calendar> {
    const calendar = await this.calendarRepository.findOneBy({ id });

    if (!calendar) {
      throw new NotFoundException('메모를 찾을 수 없습니다.');
    }
    return calendar;
  }

  //메모수정
  async update(
    id: number,
    updateCalendarDto: UpdateCalendarDto,
  ): Promise<Calendar> {
    const calendar = await this.findOne(id);
    this.calendarRepository.merge(calendar, updateCalendarDto);
    return this.calendarRepository.save(calendar);
  }

  //메모삭제
  async delete(id: number): Promise<void> {
    const calendar = await this.findOne(id);
    await this.calendarRepository.delete(calendar);
  }
}
