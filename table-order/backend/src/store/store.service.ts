import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Store } from '../entities/store.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async findByIdentifier(identifier: string): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { identifier },
    });
  }

  async findById(id: number): Promise<Store | null> {
    return this.storeRepository.findOne({
      where: { id },
    });
  }
}
