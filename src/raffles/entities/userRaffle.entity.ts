import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Raffle } from './raffle.entity';

@Entity({
  name: 'userRaffles',
})
export class UserRaffle {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, (user) => user.userRaffle, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'bigint' })
  userId: number;

  @ManyToOne(() => Raffle, (raffle) => raffle.userRaffle, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'raffleId' })
  raffle: Raffle;

  @Column({ type: 'bigint' })
  raffleId: number;
}
