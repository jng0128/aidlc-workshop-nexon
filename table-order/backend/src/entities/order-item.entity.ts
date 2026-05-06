import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Index()
  @Column({ name: 'order_id' })
  orderId: number;

  @Column({ name: 'menu_name', nullable: false })
  menuName: string;

  @Column({ type: 'integer', nullable: false })
  quantity: number;

  @Column({ name: 'unit_price', type: 'integer', nullable: false })
  unitPrice: number;

  @ManyToOne(() => Order, (order) => order.items)
  @JoinColumn({ name: 'order_id' })
  order: Order;
}
