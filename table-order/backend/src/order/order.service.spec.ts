import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { OrderService } from './order.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { TableSession } from '../entities/table-session.entity';
import { Table } from '../entities/table.entity';
import { OrderStatus } from '../common/enums/order-status.enum';
import { SessionStatus } from '../common/enums/session-status.enum';
import { SseService } from '../sse/sse.service';

describe('OrderService', () => {
  let service: OrderService;
  let orderRepository: any;
  let orderItemRepository: any;
  let sessionRepository: any;
  let tableRepository: any;
  let sseService: any;

  beforeEach(async () => {
    orderRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    orderItemRepository = {
      create: jest.fn(),
      save: jest.fn(),
    };

    sessionRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    tableRepository = {
      findOne: jest.fn(),
    };

    sseService = {
      emitEvent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrderService,
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemRepository },
        { provide: getRepositoryToken(TableSession), useValue: sessionRepository },
        { provide: getRepositoryToken(Table), useValue: tableRepository },
        { provide: SseService, useValue: sseService },
      ],
    }).compile();

    service = module.get<OrderService>(OrderService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should generate correct order number and calculate total', async () => {
      const dto = {
        items: [
          { menuName: '아메리카노', quantity: 2, unitPrice: 4500 },
          { menuName: '라떼', quantity: 1, unitPrice: 5000 },
        ],
      };

      // Mock active session exists
      const session = { id: 1, tableId: 1, status: SessionStatus.ACTIVE };
      sessionRepository.findOne.mockResolvedValue(session);

      // Mock order count for today
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getCount: jest.fn().mockResolvedValue(3),
      };
      orderRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      // Mock order creation
      const createdOrder = {
        id: 1,
        orderNumber: 'ORD-20260506-0004',
        tableId: 1,
        sessionId: 1,
        status: OrderStatus.PENDING,
        totalAmount: 14000,
      };
      orderRepository.create.mockReturnValue(createdOrder);
      orderRepository.save.mockResolvedValue(createdOrder);

      // Mock order items creation
      const items = [
        { id: 1, orderId: 1, menuName: '아메리카노', quantity: 2, unitPrice: 4500 },
        { id: 2, orderId: 1, menuName: '라떼', quantity: 1, unitPrice: 5000 },
      ];
      orderItemRepository.create
        .mockReturnValueOnce(items[0])
        .mockReturnValueOnce(items[1]);
      orderItemRepository.save.mockResolvedValue(items);

      const result = await service.create(1, 1, dto);

      // Verify total calculation: (2 * 4500) + (1 * 5000) = 14000
      expect(orderRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          totalAmount: 14000,
          tableId: 1,
          sessionId: 1,
          status: OrderStatus.PENDING,
        }),
      );

      // Verify order number format (ORD-YYYYMMDD-NNNN)
      const orderNumberArg = orderRepository.create.mock.calls[0][0].orderNumber;
      expect(orderNumberArg).toMatch(/^ORD-\d{8}-\d{4}$/);

      expect(result.items).toEqual(items);
    });
  });

  describe('updateStatus', () => {
    it('should throw BadRequestException for invalid transition from COMPLETED', async () => {
      const order = {
        id: 1,
        status: OrderStatus.COMPLETED,
        items: [],
      };
      orderRepository.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, 1, OrderStatus.PREPARING),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for invalid transition from CANCELLED', async () => {
      const order = {
        id: 1,
        status: OrderStatus.CANCELLED,
        items: [],
      };
      orderRepository.findOne.mockResolvedValue(order);

      await expect(
        service.updateStatus(1, 1, OrderStatus.PENDING),
      ).rejects.toThrow(BadRequestException);
    });

    it('should succeed for valid transition PENDING → PREPARING', async () => {
      const order = {
        id: 1,
        status: OrderStatus.PENDING,
        items: [],
      };
      orderRepository.findOne.mockResolvedValue(order);

      const updatedOrder = { ...order, status: OrderStatus.PREPARING };
      orderRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus(1, 1, OrderStatus.PREPARING);

      expect(result.status).toBe(OrderStatus.PREPARING);
      expect(orderRepository.save).toHaveBeenCalled();
    });

    it('should succeed for valid transition PREPARING → COMPLETED', async () => {
      const order = {
        id: 1,
        status: OrderStatus.PREPARING,
        items: [],
      };
      orderRepository.findOne.mockResolvedValue(order);

      const updatedOrder = { ...order, status: OrderStatus.COMPLETED };
      orderRepository.save.mockResolvedValue(updatedOrder);

      const result = await service.updateStatus(1, 1, OrderStatus.COMPLETED);

      expect(result.status).toBe(OrderStatus.COMPLETED);
    });

    it('should throw NotFoundException when order not found', async () => {
      orderRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateStatus(999, 1, OrderStatus.PREPARING),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
