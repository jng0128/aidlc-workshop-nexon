import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { Admin } from './admin.entity';
import { Table } from './table.entity';
import { Category } from './category.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: false })
  identifier: string;

  @Column({ nullable: false })
  name: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => Admin, (admin) => admin.store)
  admins: Admin[];

  @OneToMany(() => Table, (table) => table.store)
  tables: Table[];

  @OneToMany(() => Category, (category) => category.store)
  categories: Category[];
}
