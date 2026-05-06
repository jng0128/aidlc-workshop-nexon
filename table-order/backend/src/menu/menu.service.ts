import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Menu } from '../entities/menu.entity';
import { Category } from '../entities/category.entity';
import { CreateMenuDto, UpdateMenuDto, ReorderMenusDto } from './dto';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  async findAll(storeId: number, categoryId?: number): Promise<Menu[]> {
    const where: FindOptionsWhere<Menu> = { storeId };
    if (categoryId) {
      where.categoryId = categoryId;
    }

    return this.menuRepository.find({
      where,
      relations: ['category'],
      order: { displayOrder: 'ASC' },
    });
  }

  async findOne(id: number, storeId: number): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id, storeId },
      relations: ['category'],
    });

    if (!menu) {
      throw new NotFoundException('메뉴를 찾을 수 없습니다.');
    }

    return menu;
  }

  async create(storeId: number, dto: CreateMenuDto): Promise<Menu> {
    // Verify category exists for this store
    const category = await this.categoryRepository.findOne({
      where: { id: dto.categoryId, storeId },
    });

    if (!category) {
      throw new BadRequestException('유효하지 않은 카테고리입니다');
    }

    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined) {
      const maxResult = await this.menuRepository
        .createQueryBuilder('menu')
        .select('MAX(menu.displayOrder)', 'max')
        .where('menu.storeId = :storeId', { storeId })
        .andWhere('menu.categoryId = :categoryId', { categoryId: dto.categoryId })
        .getRawOne();
      displayOrder = (maxResult?.max ?? -1) + 1;
    }

    const menu = this.menuRepository.create({
      name: dto.name,
      price: dto.price,
      description: dto.description,
      imageUrl: dto.imageUrl,
      categoryId: dto.categoryId,
      displayOrder,
      storeId,
    });

    return this.menuRepository.save(menu);
  }

  async update(id: number, storeId: number, dto: UpdateMenuDto): Promise<Menu> {
    const menu = await this.menuRepository.findOne({
      where: { id, storeId },
    });

    if (!menu) {
      throw new NotFoundException('메뉴를 찾을 수 없습니다.');
    }

    // If categoryId changed, verify new category exists
    if (dto.categoryId && dto.categoryId !== menu.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: dto.categoryId, storeId },
      });

      if (!category) {
        throw new BadRequestException('유효하지 않은 카테고리입니다');
      }
    }

    Object.assign(menu, dto);
    return this.menuRepository.save(menu);
  }

  async delete(id: number, storeId: number): Promise<void> {
    const menu = await this.menuRepository.findOne({
      where: { id, storeId },
    });

    if (!menu) {
      throw new NotFoundException('메뉴를 찾을 수 없습니다.');
    }

    await this.menuRepository.remove(menu);
  }

  async reorder(storeId: number, dto: ReorderMenusDto): Promise<Menu[]> {
    for (const item of dto.items) {
      await this.menuRepository.update(
        { id: item.id, storeId },
        { displayOrder: item.displayOrder },
      );
    }

    return this.findAll(storeId);
  }
}
