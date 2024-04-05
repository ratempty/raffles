import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';

@Entity({
  name: 'news',
})
@Unique(['newsUrl'])
export class News {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar' })
  newsUrl: string;

  @Column({ type: 'varchar' })
  newsImg: string;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar' })
  title: string;

  @Column({ type: 'varchar' })
  subTitle: string;

  @Column({ default: 0 })
  views: number;

  @CreateDateColumn()
  createdAt: Date;
}
