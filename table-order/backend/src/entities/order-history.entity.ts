import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
} from 'typeorm';

@Entity('order_history')
export class OrderHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'table_id' })
  tableId: number;

  @Column({ name: 'session_id', nullable: false })
  sessionId: number;

  @Column({ name: 'order_number', nullable: false })
  orderNumber: string;

  @Column({ name: 'order_data', type: 'jsonb', nullable: false })
  orderData: Record<string, any>;

  @Column({ name: 'total_amount', type: 'integer', nullable: false })
  totalAmount: number;

  @Column({ name: 'ordered_at', type: 'timestamp', nullable: false })
  orderedAt: Date;

  @Column({ name: 'completed_at', type: 'timestamp', nullable: false })
  completedAt: Date;
}
