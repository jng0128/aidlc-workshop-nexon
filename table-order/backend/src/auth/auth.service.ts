import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';

import { Store } from '../entities/store.entity';
import { Admin } from '../entities/admin.entity';
import { Table } from '../entities/table.entity';
import { AdminLoginDto } from './dto/admin-login.dto';
import { TableLoginDto } from './dto/table-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';
import { JwtPayload } from './strategies/jwt.strategy';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MINUTES = 15;

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    @InjectRepository(Admin)
    private readonly adminRepository: Repository<Admin>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    private readonly jwtService: JwtService,
  ) {}

  async adminLogin(dto: AdminLoginDto): Promise<LoginResponseDto> {
    // 1. Find store by identifier
    const store = await this.storeRepository.findOne({
      where: { identifier: dto.storeIdentifier },
    });
    if (!store) {
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 2. Find admin by storeId + username
    const admin = await this.adminRepository.findOne({
      where: { storeId: store.id, username: dto.username },
    });
    if (!admin) {
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 3. Check if locked
    if (admin.lockedUntil && admin.lockedUntil > new Date()) {
      throw new ForbiddenException(
        '계정이 잠겼습니다. 잠시 후 다시 시도해주세요.',
      );
    }

    // 4. Compare password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      admin.passwordHash,
    );
    if (!isPasswordValid) {
      // Increment login attempts
      admin.loginAttempts += 1;

      // Lock at MAX_LOGIN_ATTEMPTS
      if (admin.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        const lockUntil = new Date();
        lockUntil.setMinutes(lockUntil.getMinutes() + LOCK_DURATION_MINUTES);
        admin.lockedUntil = lockUntil;
      }

      await this.adminRepository.save(admin);
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 5. Success: reset login attempts
    admin.loginAttempts = 0;
    admin.lockedUntil = null;
    await this.adminRepository.save(admin);

    // Generate JWT
    const payload: JwtPayload = {
      sub: String(admin.id),
      role: 'admin',
      storeId: store.id,
    };

    const accessToken = this.generateToken(payload);

    return {
      accessToken,
      expiresIn: this.jwtService.decode(accessToken)?.['exp']
        ? '16h'
        : '16h',
      admin: {
        id: admin.id,
        username: admin.username,
        storeId: store.id,
        storeName: store.name,
      },
    };
  }

  async tableLogin(dto: TableLoginDto): Promise<LoginResponseDto> {
    // 1. Find store by identifier
    const store = await this.storeRepository.findOne({
      where: { identifier: dto.storeIdentifier },
    });
    if (!store) {
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 2. Find table by storeId + tableNumber
    const table = await this.tableRepository.findOne({
      where: { storeId: store.id, tableNumber: dto.tableNumber },
    });
    if (!table) {
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 3. Compare password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      table.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('인증 정보가 올바르지 않습니다.');
    }

    // 4. Success: generate JWT
    const payload: JwtPayload = {
      sub: String(table.id),
      role: 'table',
      storeId: store.id,
      tableId: table.id,
    };

    const accessToken = this.generateToken(payload);

    return {
      accessToken,
      expiresIn: '16h',
      table: {
        id: table.id,
        tableNumber: table.tableNumber,
        storeId: store.id,
        storeName: store.name,
      },
    };
  }

  generateToken(payload: JwtPayload): string {
    return this.jwtService.sign(payload);
  }
}
