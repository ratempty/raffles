import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../../users/types/userRole.type';
import { Calendar } from '../../calendars/entities/calendar.entity';
import { UserRaffle } from '../../raffles/entities/userRaffle.entity';

import { Market } from '../../markets/entities/market.entity';

@Entity({
  name: 'oauths',
})
export class Oauth {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', unique: true, nullable: true })
  email: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  password: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  nickName: string;

  @Column({ type: 'varchar', unique: true, nullable: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  clientId: string;

  @Column({ type: 'varchar', nullable: true })
  kakaoId: string; // 카카오에서 제공하는 사용자 고유 식별자

  @Column({ type: 'enum', enum: Role, default: Role.User })
  role: Role;

  @OneToMany(() => Calendar, (calendar) => calendar.user)
  calendar: Calendar[];

  @OneToMany(() => UserRaffle, (userRaffle) => userRaffle.user)
  userRaffle: UserRaffle[];

  @OneToMany(() => Market, (market) => market.user)
  market: Market[];
}
