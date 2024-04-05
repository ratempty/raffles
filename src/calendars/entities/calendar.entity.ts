import { User } from 'src/users/entities/user.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'calendars',
})
export class Calendar {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  memo: string;

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  memoDate: Date;

  @ManyToOne(() => User, (user) => user.calendar, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'bigint', name: 'userId', default: null })
  userId: number;
}
