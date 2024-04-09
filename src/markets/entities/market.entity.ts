import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToMany,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SaleStatus } from '../types/salesStatus.type';
import { UseStatus } from '../types/useStatus.type';
import { User } from '../../users/entities/user.entity';
import { Shoes } from './shoes.entity';

@Entity({
  name: 'markets',
})
export class Market {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  content: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'varchar' })
  size: string;

  @Column({ type: 'bigint' })
  view: number;

  @Column({ type: 'json' })
  imgUrl: string[];

  @Column({ type: 'enum', enum: SaleStatus, default: SaleStatus.Sales })
  saleStatus: SaleStatus;

  @Column({ type: 'bigint' })
  price: number;

  @Column({ type: 'enum', enum: UseStatus, default: UseStatus.New })
  useStatus: UseStatus;

  @ManyToOne(() => User, (user) => user.market, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint', name: 'userId' })
  userId: number;

  @ManyToOne(() => Shoes, (shoes) => shoes.market, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'shoesId' })
  shoes: Shoes;

  @Column({ type: 'bigint', name: 'shoesId' })
  shoesId: number;
}
