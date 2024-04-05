import { SaleStatus } from '../types/salesStatus.type';
import { UseStatus } from '../types/useStatus.type';

export class UpdateMarketDto {
  title?: string;
  content?: string;
  size?: string;
  imgUrl?: string[];
  salesStatus?: SaleStatus;
  price?: number;
  useStatus: UseStatus;
}
