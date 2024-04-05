import { IsDate, IsOptional, IsString } from 'class-validator';

export class UpdateCalendarDto {
  @IsOptional()
  @IsString({ message: '수정할 메모를 작성해주세요.' })
  memo: string;

  @IsOptional()
  @IsDate()
  memoDate: Date;
}
