import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Market } from './market.entity';

@Entity({
  name: 'Shoes',
})
export class Shoes {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  brand: string;

  @Column({ type: 'varchar' })
  shoeCode: string;

  @Column({ type: 'varchar' })
  name: string;

  @Column({ type: 'json' })
  imgUrl: string[];

  @Column({ type: 'varchar' })
  subName: string;

  @OneToMany(() => Market, (market) => market.shoes)
  market: Market[];
}
