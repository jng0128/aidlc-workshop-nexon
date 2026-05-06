import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { Store } from '../entities/store.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Store])],
  providers: [StoreService],
  exports: [StoreService],
})
export class StoreModule {}
