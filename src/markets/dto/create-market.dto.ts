import { IsJSON, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SaleStatus } from '../types/salesStatus.type';
import { UseStatus } from '../types/useStatus.type';

export class CreateMarketDto {
  @IsString()
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @IsString()
  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content: string;

  @IsString()
  @IsNotEmpty({ message: '사이즈를 입력해주세요.' })
  size: string;

  @IsJSON()
  @IsNotEmpty({ message: '이미지를 추가해주세요.' })
  imgUrl: string[];

  salesStatus: SaleStatus;

  @IsNumber()
  @IsNotEmpty({ message: '판매 가격을 입력해주세요.' })
  price: number;

  useStatus: UseStatus;
}
