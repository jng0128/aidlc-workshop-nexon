import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { DataSource } from 'typeorm';

import { SessionService } from './session.service';
import { TableSession } from '../entities/table-session.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { OrderHistory } from '../entities/order-history.entity';
import { SessionStatus } from '../common/enums/session-status.enum';

describe('SessionService', () => {
  let service: SessionService;
  let sessionRepository: any;
  let orderRepository: any;
  let orderItemRepository: any;
  let orderHistoryRepository: any;
  let dataSource: any;

  beforeEach(async () => {
    sessionRepository = {
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
    };

    orderRepository = {
      find: jest.fn(),
    };

    orderItemRepository = {};

    orderHistoryRepository = {
      create: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    dataSource = {
      createQueryRunner: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SessionService,
        { provide: getRepositoryToken(TableSession), useValue: sessionRepository },
        { provide: getRepositoryToken(Order), useValue: orderRepository },
        { provide: getRepositoryToken(OrderItem), useValue: orderItemRepository },
        { provide: getRepositoryToken(OrderHistory), useValue: orderHistoryRepository },
        { provide: DataSource, useValue: dataSource },
      ],
    }).compile();

    service = module.get<SessionService>(SessionService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getOrCreateSession', () => {
    it('should create new session when none exists', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      const newSession = {
        id: 1,
        tableId: 1,
        status: SessionStatus.ACTIVE,
      };
      sessionRepository.create.mockReturnValue(newSession);
      sessionRepository.save.mockResolvedValue(newSession);

      const result = await service.getOrCreateSession(1);

      expect(result).toEqual(newSession);
      expect(sessionRepository.create).toHaveBeenCalledWith({
        tableId: 1,
        status: SessionStatus.ACTIVE,
      });
      expect(sessionRepository.save).toHaveBeenCalledWith(newSession);
    });

    it('should return existing active session', async () => {
      const existingSession = {
        id: 5,
        tableId: 1,
        status: SessionStatus.ACTIVE,
      };
      sessionRepository.findOne.mockResolvedValue(existingSession);

      const result = await service.getOrCreateSession(1);

      expect(result).toEqual(existingSession);
      expect(sessionRepository.create).not.toHaveBeenCalled();
      expect(sessionRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('completeSession', () => {
    it('should throw BadRequestException when no active session exists', async () => {
      sessionRepository.findOne.mockResolvedValue(null);

      await expect(service.completeSession(1)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.completeSession(1)).rejects.toThrow(
        '활성 세션이 없습니다',
      );
    });

    it('should complete session with transaction', async () => {
      const session = {
        id: 1,
        tableId: 1,
        status: SessionStatus.ACTIVE,
        completedAt: null,
      };
      sessionRepository.findOne.mockResolvedValue(session);

      const orders = [
        {
          id: 1,
          orderNumber: 'ORD-20260506-0001',
          status: 'COMPLETED',
          totalAmount: 9000,
          createdAt: new Date('2026-05-06T10:00:00Z'),
          items: [
            { id: 1, menuName: '아메리카노', quantity: 2, unitPrice: 4500 },
          ],
        },
      ];
      orderRepository.find.mockResolvedValue(orders);

      const historyEntry = { id: 1 };
      orderHistoryRepository.create.mockReturnValue(historyEntry);

      const queryRunner = {
        connect: jest.fn(),
        startTransaction: jest.fn(),
        commitTransaction: jest.fn(),
        rollbackTransaction: jest.fn(),
        release: jest.fn(),
        manager: {
          save: jest.fn(),
          remove: jest.fn(),
        },
      };
      dataSource.createQueryRunner.mockReturnValue(queryRunner);

      await service.completeSession(1);

      expect(queryRunner.connect).toHaveBeenCalled();
      expect(queryRunner.startTransaction).toHaveBeenCalled();
      expect(queryRunner.manager.save).toHaveBeenCalled();
      expect(queryRunner.manager.remove).toHaveBeenCalled();
      expect(queryRunner.commitTransaction).toHaveBeenCalled();
      expect(queryRunner.release).toHaveBeenCalled();
    });
  });
});
