import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { Table } from './table.entity';
import { TableSession } from './table-session.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatus } from '../common/enums/order-status.enum';

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_number', unique: true, nullable: false })
  orderNumber: string;

  @Index()
  @Column({ name: 'table_id' })
  tableId: number;

  @Index()
  @Column({ name: 'session_id' })
  sessionId: number;

  @Index()
  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING,
  })
  status: OrderStatus;

  @Column({ name: 'total_amount', type: 'integer', nullable: false })
  totalAmount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Table)
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToOne(() => TableSession, (session) => session.orders)
  @JoinColumn({ name: 'session_id' })
  session: TableSession;

  @OneToMany(() => OrderItem, (item) => item.order)
  items: OrderItem[];
}
