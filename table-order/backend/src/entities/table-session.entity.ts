import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Table } from './table.entity';
import { Order } from './order.entity';
import { SessionStatus } from '../common/enums/session-status.enum';

@Entity('table_sessions')
export class TableSession {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'table_id' })
  tableId: number;

  @Column({
    type: 'enum',
    enum: SessionStatus,
    default: SessionStatus.ACTIVE,
  })
  status: SessionStatus;

  @CreateDateColumn({ name: 'started_at' })
  startedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ManyToOne(() => Table, (table) => table.sessions)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @OneToMany(() => Order, (order) => order.session)
  orders: Order[];
}
