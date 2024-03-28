import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from '../types/userRole.type';
import { Calendar } from 'src/calendars/entities/calendar.entity';
import { UserRaffle } from 'src/raffles/entities/userRaffle.entity';
import { Market } from 'src/markets/entities/market.entity';

@Entity({
  name: 'users',
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar' })
  password: string;

  @Column({ type: 'varchar', unique: true })
  nickName: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  clientId: string;

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @OneToMany(() => Calendar, (calendar) => calendar.user)
  calendar: Calendar[];

  @OneToMany(() => UserRaffle, (userRaffle) => userRaffle.user)
  userRaffle: UserRaffle[];

  @OneToMany(() => Market, (market) => market.user)
  market: Market[];
}
