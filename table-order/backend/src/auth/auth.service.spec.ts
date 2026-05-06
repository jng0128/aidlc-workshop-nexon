import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

import { AuthService } from './auth.service';
import { Store } from '../entities/store.entity';
import { Admin } from '../entities/admin.entity';
import { Table } from '../entities/table.entity';

jest.mock('bcryptjs');

describe('AuthService', () => {
  let service: AuthService;
  let storeRepository: any;
  let adminRepository: any;
  let tableRepository: any;
  let jwtService: any;

  const mockStore: Partial<Store> = {
    id: 1,
    identifier: 'test-store',
    name: '테스트 매장',
    createdAt: new Date(),
  };

  const mockAdmin: Partial<Admin> = {
    id: 1,
    username: 'admin1',
    passwordHash: '$2b$10$hashedpassword',
    storeId: 1,
    loginAttempts: 0,
    lockedUntil: null,
    createdAt: new Date(),
  };

  const mockTable = {
    id: 1,
    tableNumber: 1,
    passwordHash: '$2b$10$hashedpassword',
    storeId: 1,
    createdAt: new Date(),
  };

  beforeEach(async () => {
    storeRepository = {
      findOne: jest.fn(),
    };
    adminRepository = {
      findOne: jest.fn(),
      save: jest.fn(),
    };
    tableRepository = {
      findOne: jest.fn(),
    };
    jwtService = {
      sign: jest.fn().mockReturnValue('mock-jwt-token'),
      decode: jest.fn().mockReturnValue({ exp: 1234567890 }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(Store), useValue: storeRepository },
        { provide: getRepositoryToken(Admin), useValue: adminRepository },
        { provide: getRepositoryToken(Table), useValue: tableRepository },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('adminLogin', () => {
    const loginDto = {
      storeIdentifier: 'test-store',
      username: 'admin1',
      password: 'password123',
    };

    it('should login successfully and return token with admin info', async () => {
      storeRepository.findOne.mockResolvedValue(mockStore);
      adminRepository.findOne.mockResolvedValue({ ...mockAdmin });
      adminRepository.save.mockResolvedValue({ ...mockAdmin });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.adminLogin(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.admin).toBeDefined();
      expect(result.admin!.id).toBe(1);
      expect(result.admin!.username).toBe('admin1');
      expect(result.admin!.storeId).toBe(1);
      expect(result.admin!.storeName).toBe('테스트 매장');

      // Verify login attempts reset
      expect(adminRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ loginAttempts: 0, lockedUntil: null }),
      );

      // Verify JWT payload
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        role: 'admin',
        storeId: 1,
      });
    });

    it('should throw UnauthorizedException if store not found', async () => {
      storeRepository.findOne.mockResolvedValue(null);

      await expect(service.adminLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if admin not found', async () => {
      storeRepository.findOne.mockResolvedValue(mockStore);
      adminRepository.findOne.mockResolvedValue(null);

      await expect(service.adminLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should increment loginAttempts on wrong password', async () => {
      const admin = { ...mockAdmin, loginAttempts: 0 };
      storeRepository.findOne.mockResolvedValue(mockStore);
      adminRepository.findOne.mockResolvedValue(admin);
      adminRepository.save.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.adminLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(adminRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ loginAttempts: 1 }),
      );
    });

    it('should lock account after 5 failed attempts', async () => {
      const admin = { ...mockAdmin, loginAttempts: 4 };
      storeRepository.findOne.mockResolvedValue(mockStore);
      adminRepository.findOne.mockResolvedValue(admin);
      adminRepository.save.mockResolvedValue(admin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.adminLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );

      expect(adminRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          loginAttempts: 5,
          lockedUntil: expect.any(Date),
        }),
      );
    });

    it('should throw ForbiddenException if account is locked', async () => {
      const futureDate = new Date();
      futureDate.setMinutes(futureDate.getMinutes() + 10);
      const lockedAdmin = { ...mockAdmin, lockedUntil: futureDate };

      storeRepository.findOne.mockResolvedValue(mockStore);
      adminRepository.findOne.mockResolvedValue(lockedAdmin);

      await expect(service.adminLogin(loginDto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should allow login if lock has expired', async () => {
      const pastDate = new Date();
      pastDate.setMinutes(pastDate.getMinutes() - 10);
      const expiredLockAdmin = {
        ...mockAdmin,
        lockedUntil: pastDate,
        loginAttempts: 5,
      };

      storeRepository.findOne.mockResolvedValue(mockStore);
      adminRepository.findOne.mockResolvedValue(expiredLockAdmin);
      adminRepository.save.mockResolvedValue(expiredLockAdmin);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.adminLogin(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(adminRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ loginAttempts: 0, lockedUntil: null }),
      );
    });
  });

  describe('tableLogin', () => {
    const loginDto = {
      storeIdentifier: 'test-store',
      tableNumber: 1,
      password: 'table123',
    };

    it('should login successfully and return token with table info', async () => {
      storeRepository.findOne.mockResolvedValue(mockStore);
      tableRepository.findOne.mockResolvedValue({ ...mockTable });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.tableLogin(loginDto);

      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.table).toBeDefined();
      expect(result.table!.id).toBe(1);
      expect(result.table!.tableNumber).toBe(1);
      expect(result.table!.storeId).toBe(1);
      expect(result.table!.storeName).toBe('테스트 매장');

      // Verify JWT payload
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: '1',
        role: 'table',
        storeId: 1,
        tableId: 1,
      });
    });

    it('should throw UnauthorizedException if store not found', async () => {
      storeRepository.findOne.mockResolvedValue(null);

      await expect(service.tableLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if table not found', async () => {
      storeRepository.findOne.mockResolvedValue(mockStore);
      tableRepository.findOne.mockResolvedValue(null);

      await expect(service.tableLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException on wrong password', async () => {
      storeRepository.findOne.mockResolvedValue(mockStore);
      tableRepository.findOne.mockResolvedValue({ ...mockTable });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.tableLogin(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('generateToken', () => {
    it('should call jwtService.sign with the payload', () => {
      const payload = { sub: '1', role: 'admin' as const, storeId: 1 };

      const result = service.generateToken(payload);

      expect(jwtService.sign).toHaveBeenCalledWith(payload);
      expect(result).toBe('mock-jwt-token');
    });
  });
});
