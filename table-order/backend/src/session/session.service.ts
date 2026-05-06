import {
  Injectable,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { TableSession } from '../entities/table-session.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderHistory } from '../entities/order-history.entity';
import { SessionStatus } from '../common/enums/session-status.enum';
import { SseService } from '../sse/sse.service';

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(TableSession)
    private readonly sessionRepository: Repository<TableSession>,
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderHistory)
    private readonly orderHistoryRepository: Repository<OrderHistory>,
    private readonly dataSource: DataSource,
    private readonly sseService: SseService,
  ) {}

  async getOrCreateSession(tableId: number): Promise<TableSession> {
    let session = await this.sessionRepository.findOne({
      where: { tableId, status: SessionStatus.ACTIVE },
    });

    if (!session) {
      session = this.sessionRepository.create({
        tableId,
        status: SessionStatus.ACTIVE,
      });
      session = await this.sessionRepository.save(session);
    }

    return session;
  }

  async getCurrentSession(tableId: number): Promise<TableSession | null> {
    return this.sessionRepository.findOne({
      where: { tableId, status: SessionStatus.ACTIVE },
    });
  }

  async completeSession(tableId: number): Promise<void> {
    const session = await this.sessionRepository.findOne({
      where: { tableId, status: SessionStatus.ACTIVE },
    });

    if (!session) {
      throw new BadRequestException('활성 세션이 없습니다');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Find all orders for this session with items
      const orders = await this.orderRepository.find({
        where: { sessionId: session.id },
        relations: ['items'],
      });

      // Create order history entries
      const now = new Date();
      for (const order of orders) {
        const historyEntry = this.orderHistoryRepository.create({
          tableId,
          sessionId: session.id,
          orderNumber: order.orderNumber,
          orderData: {
            id: order.id,
            orderNumber: order.orderNumber,
            status: order.status,
            totalAmount: order.totalAmount,
            createdAt: order.createdAt,
            items: order.items.map((item) => ({
              id: item.id,
              menuName: item.menuName,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
            })),
          },
          totalAmount: order.totalAmount,
          orderedAt: order.createdAt,
          completedAt: now,
        });
        await queryRunner.manager.save(historyEntry);
      }

      // Delete all order items for these orders
      for (const order of orders) {
        if (order.items && order.items.length > 0) {
          await queryRunner.manager.remove(order.items);
        }
      }

      // Delete all orders for this session
      if (orders.length > 0) {
        await queryRunner.manager.remove(orders);
      }

      // Update session status
      session.status = SessionStatus.COMPLETED;
      session.completedAt = now;
      await queryRunner.manager.save(session);

      await queryRunner.commitTransaction();

      // Emit SSE event after successful commit
      this.sseService.emitEvent('session:completed', {
        type: 'session:completed',
        tableId,
      });
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getHistory(
    tableId: number,
    startDate?: string,
    endDate?: string,
  ): Promise<OrderHistory[]> {
    const queryBuilder = this.orderHistoryRepository
      .createQueryBuilder('history')
      .where('history.tableId = :tableId', { tableId });

    if (startDate) {
      queryBuilder.andWhere('history.completedAt >= :startDate', {
        startDate: new Date(startDate),
      });
    }

    if (endDate) {
      queryBuilder.andWhere('history.completedAt <= :endDate', {
        endDate: new Date(endDate),
      });
    }

    queryBuilder.orderBy('history.completedAt', 'DESC');

    return queryBuilder.getMany();
  }
}
