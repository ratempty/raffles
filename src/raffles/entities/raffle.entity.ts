import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { UserRaffle } from './userRaffle.entity';

@Entity({
  name: 'raffles',
})
export class Raffle {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'varchar' })
  subName: string;

  @Column({ type: 'varchar' })
  raffleUrl: string;

  @Column({ type: 'varchar' })
  shoeCode: string;

  @Column({ type: 'varchar' })
  brand: string;

  @Column({ type: 'varchar', nullable: true })
  relPrice: string;

  @Column({ type: 'varchar' })
  imgUrl: string;

  @Column({ type: 'bigint', nullable: true })
  raffleStartDate: number;

  @Column({ type: 'bigint', nullable: true })
  raffleEndDate: number;

  @OneToMany(() => UserRaffle, (userRaffle) => userRaffle.raffle)
  userRaffle: UserRaffle;
}
