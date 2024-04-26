import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { SaleStatus } from '../types/salesStatus.type';
import { UseStatus } from '../types/useStatus.type';

export class CreateMarketDto {
  @IsNotEmpty({ message: '제목을 입력해주세요.' })
  title: string;

  @IsNotEmpty({ message: '내용을 입력해주세요.' })
  content: string;

  @IsNotEmpty({ message: '사이즈를 입력해주세요.' })
  size: string;

  salesStatus: SaleStatus = SaleStatus.Sales;

  @IsNotEmpty({ message: '판매 가격을 입력해주세요.' })
  price: number;

  useStatus: UseStatus = UseStatus.New;
}
