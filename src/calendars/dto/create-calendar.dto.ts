// create-calendar.dto.ts
import { IsNotEmpty, IsDate, IsString } from 'class-validator';

export class CreateCalendarDto {
  @IsNotEmpty()
  @IsString({ message: '메모를 작성해주세요.' })
  memo: string;

  @IsNotEmpty()
  @IsDate()
  memoDate: Date;
}
