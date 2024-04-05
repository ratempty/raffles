import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class SaveShoesDto {
  @IsString()
  @IsNotEmpty({ message: '브랜드를 입력해주세요' })
  brand: string;
}
