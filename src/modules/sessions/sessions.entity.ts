import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Exclude } from 'class-transformer';

import { User } from '../users/users.entity';

@Entity('sessions')
export class Session {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { eager: false })
  user: User;

  @Column()
  userId: number;

  @Column()
  @Exclude()
  token: string;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column()
  os: string;

  @Column()
  browser: string;

  @Column('bigint')
  expiresIn: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
