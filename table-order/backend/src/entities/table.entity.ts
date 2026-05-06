import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Store } from './store.entity';
import { TableSession } from './table-session.entity';

@Entity('tables')
@Unique(['storeId', 'tableNumber'])
export class Table {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'table_number', nullable: false })
  tableNumber: number;

  @Column({ name: 'password_hash', nullable: false })
  passwordHash: string;

  @Index()
  @Column({ name: 'store_id' })
  storeId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Store, (store) => store.tables)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => TableSession, (session) => session.table)
  sessions: TableSession[];
}
