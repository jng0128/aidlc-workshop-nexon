import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
  Unique,
} from 'typeorm';
import { Store } from './store.entity';
import { Menu } from './menu.entity';

@Entity('categories')
@Unique(['storeId', 'name'])
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: false })
  name: string;

  @Column({ name: 'display_order', default: 0 })
  displayOrder: number;

  @Index()
  @Column({ name: 'store_id' })
  storeId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => Store, (store) => store.categories)
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => Menu, (menu) => menu.category)
  menus: Menu[];
}
