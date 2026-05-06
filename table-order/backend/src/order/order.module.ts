import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableSession } from '../entities/table-session.entity';
import { Table } from '../entities/table.entity';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, TableSession, Table]),
    SseModule,
  ],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
