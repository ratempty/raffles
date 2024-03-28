import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({
  name: 'calendars',
})
export class Calendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  memo: string;

  @Column({ type: 'date' })
  memoDate: Date;

  @ManyToOne(() => User, (user) => user.calendar, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'bigint', name: 'userId' })
  userId: number;
}
