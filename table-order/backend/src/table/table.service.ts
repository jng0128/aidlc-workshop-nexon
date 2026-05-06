import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Table } from '../entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
  ) {}

  async findAll(storeId: number): Promise<Table[]> {
    return this.tableRepository.find({
      where: { storeId },
      order: { tableNumber: 'ASC' },
    });
  }

  async create(storeId: number, dto: CreateTableDto): Promise<Table> {
    // Check tableNumber uniqueness within store
    const existing = await this.tableRepository.findOne({
      where: { storeId, tableNumber: dto.tableNumber },
    });

    if (existing) {
      throw new ConflictException('이미 존재하는 테이블 번호입니다.');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    const table = this.tableRepository.create({
      tableNumber: dto.tableNumber,
      passwordHash,
      storeId,
    });

    return this.tableRepository.save(table);
  }

  async update(id: number, storeId: number, dto: UpdateTableDto): Promise<Table> {
    const table = await this.tableRepository.findOne({
      where: { id, storeId },
    });

    if (!table) {
      throw new NotFoundException('테이블을 찾을 수 없습니다.');
    }

    if (dto.password) {
      table.passwordHash = await bcrypt.hash(dto.password, 10);
    }

    return this.tableRepository.save(table);
  }
}
