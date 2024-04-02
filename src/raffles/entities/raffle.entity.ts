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

  @Column({ type: 'bigint' })
  relPrice: number;

  @Column({ type: 'json' })
  imgUrl: string[];

  @Column({ type: 'date' })
  raffleStartDate: Date;

  @Column({ type: 'date' })
  raffleEndDate: Date;

  @OneToMany(() => UserRaffle, (userRaffle) => userRaffle.raffle)
  userRaffle: UserRaffle[];
}
