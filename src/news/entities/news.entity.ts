import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity({
  name: 'news',
})
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  newsUrl: string;

  @Column({ type: 'json' })
  newsImg: string[];

  @Column({ type: 'varchar' })
  content: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: Date })
  newsDate: Date;
}
