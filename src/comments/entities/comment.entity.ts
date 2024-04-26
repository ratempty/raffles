import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Market } from '../../markets/entities/market.entity';
import { User } from '../../users/entities/user.entity';

@Entity({
  name: 'comments',
})
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  content: string;

  @ManyToOne(() => Market, (market) => market.comment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'marketId' })
  market: Market;

  @Column({ type: 'bigint', name: 'marketId' })
  marketId: number;

  @ManyToOne(() => User, (user) => user.comment)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint', name: 'userId' })
  userId: number;
}
