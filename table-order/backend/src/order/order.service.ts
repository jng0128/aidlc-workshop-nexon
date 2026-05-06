import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableSession } from '../entities/table-session.entity';
import { Table } from '../entities/table.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { SessionStatus } from '../common/enums/session-status.enum';
import { CreateOrderDto } from './dto/create-order.dto';
import { SseService } from '../sse/sse.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(TableSession)
    private readonly sessionRepository: Repository<TableSession>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly sseService: SseService,
  ) {}

  async create(tableId: number, storeId: number, dto: CreateOrderDto): Promise<Order> {
    // Get or create active session
    const session = await this.getOrCreateSession(tableId);

    // Generate order number
    const orderNumber = await this.generateOrderNumber();

    // Calculate total amount
    const totalAmount = dto.items.reduce(
      (sum, item) => sum + item.quantity * item.unitPrice,
      0,
    );

    // Create order
    const order = this.orderRepository.create({
      orderNumber,
      tableId,
      sessionId: session.id,
      status: OrderStatus.PENDING,
      totalAmount,
    });

    const savedOrder = await this.orderRepository.save(order);

    // Create order items
    const orderItems = dto.items.map((item) =>
      this.orderItemRepository.create({
        orderId: savedOrder.id,
        menuName: item.menuName,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      }),
    );

    savedOrder.items = await this.orderItemRepository.save(orderItems);

    // Emit SSE event for new order
    this.sseService.emitEvent('order:created', {
      type: 'order:created',
      order: savedOrder,
    });

    return savedOrder;
  }

  async findByStore(storeId: number): Promise<Order[]> {
    // Find all active sessions for this store
    const activeSessions = await this.sessionRepository
      .createQueryBuilder('session')
      .innerJoin('session.table', 'table')
      .where('table.storeId = :storeId', { storeId })
      .andWhere('session.status = :status', { status: SessionStatus.ACTIVE })
      .getMany();

    if (activeSessions.length === 0) {
      return [];
    }

    const sessionIds = activeSessions.map((s) => s.id);

    return this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .where('order.sessionId IN (:...sessionIds)', { sessionIds })
      .orderBy('order.createdAt', 'DESC')
      .getMany();
  }

  async findBySession(sessionId: number): Promise<Order[]> {
    return this.orderRepository.find({
      where: { sessionId },
      relations: ['items'],
      order: { createdAt: 'ASC' },
    });
  }

  async findByTable(tableId: number): Promise<Order[]> {
    // Find active session for this table
    const session = await this.sessionRepository.findOne({
      where: { tableId, status: SessionStatus.ACTIVE },
    });

    if (!session) {
      return [];
    }

    return this.orderRepository.find({
      where: { sessionId: session.id },
      relations: ['items'],
      order: { createdAt: 'ASC' },
    });
  }

  async updateStatus(
    id: number,
    storeId: number,
    status: OrderStatus,
  ): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    // Validate state transition
    this.validateStatusTransition(order.status, status);

    order.status = status;
    const savedOrder = await this.orderRepository.save(order);

    // Emit SSE event for status change
    this.sseService.emitEvent('order:statusChanged', {
      type: 'order:statusChanged',
      orderId: order.id,
      tableId: order.tableId,
      newStatus: status,
    });

    return savedOrder;
  }

  async delete(id: number, storeId: number): Promise<void> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items'],
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    // Emit SSE event before deletion
    this.sseService.emitEvent('order:deleted', {
      type: 'order:deleted',
      orderId: order.id,
      tableId: order.tableId,
    });

    await this.orderRepository.remove(order);
  }

  async getTableTotal(tableId: number): Promise<number> {
    const session = await this.sessionRepository.findOne({
      where: { tableId, status: SessionStatus.ACTIVE },
    });

    if (!session) {
      return 0;
    }

    const result = await this.orderRepository
      .createQueryBuilder('order')
      .select('SUM(order.totalAmount)', 'total')
      .where('order.sessionId = :sessionId', { sessionId: session.id })
      .getRawOne();

    return Number(result?.total) || 0;
  }

  private validateStatusTransition(
    currentStatus: OrderStatus,
    newStatus: OrderStatus,
  ): void {
    const allowedTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.CANCELLED],
      [OrderStatus.PREPARING]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.CANCELLED]: [],
    };

    const allowed = allowedTransitions[currentStatus];

    if (!allowed || !allowed.includes(newStatus)) {
      throw new BadRequestException(
        `주문 상태를 ${currentStatus}에서 ${newStatus}(으)로 변경할 수 없습니다.`,
      );
    }
  }

  private async getOrCreateSession(tableId: number): Promise<TableSession> {
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

  private async generateOrderNumber(): Promise<string> {
    const today = new Date();
    const dateStr = today.toISOString().slice(0, 10).replace(/-/g, '');

    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);

    const count = await this.orderRepository
      .createQueryBuilder('order')
      .where('order.createdAt >= :start', { start: startOfDay })
      .andWhere('order.createdAt < :end', { end: endOfDay })
      .getCount();

    const seq = String(count + 1).padStart(4, '0');
    return `ORD-${dateStr}-${seq}`;
  }
}
