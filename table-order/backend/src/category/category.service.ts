import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../entities/category.entity';
import { Menu } from '../entities/menu.entity';
import { CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto } from './dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  async findAll(storeId: number): Promise<Category[]> {
    return this.categoryRepository.find({
      where: { storeId },
      order: { displayOrder: 'ASC' },
    });
  }

  async create(storeId: number, dto: CreateCategoryDto): Promise<Category> {
    // Check name uniqueness within store (case-insensitive)
    const existing = await this.categoryRepository
      .createQueryBuilder('category')
      .where('category.storeId = :storeId', { storeId })
      .andWhere('LOWER(category.name) = LOWER(:name)', { name: dto.name })
      .getOne();

    if (existing) {
      throw new ConflictException('이미 존재하는 카테고리 이름입니다.');
    }

    let displayOrder = dto.displayOrder;
    if (displayOrder === undefined) {
      const maxResult = await this.categoryRepository
        .createQueryBuilder('category')
        .select('MAX(category.displayOrder)', 'max')
        .where('category.storeId = :storeId', { storeId })
        .getRawOne();
      displayOrder = (maxResult?.max ?? -1) + 1;
    }

    const category = this.categoryRepository.create({
      name: dto.name,
      displayOrder,
      storeId,
    });

    return this.categoryRepository.save(category);
  }

  async update(
    id: number,
    storeId: number,
    dto: UpdateCategoryDto,
  ): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id, storeId },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    // If name changed, check uniqueness
    if (dto.name && dto.name !== category.name) {
      const existing = await this.categoryRepository
        .createQueryBuilder('category')
        .where('category.storeId = :storeId', { storeId })
        .andWhere('LOWER(category.name) = LOWER(:name)', { name: dto.name })
        .andWhere('category.id != :id', { id })
        .getOne();

      if (existing) {
        throw new ConflictException('이미 존재하는 카테고리 이름입니다.');
      }
    }

    Object.assign(category, dto);
    return this.categoryRepository.save(category);
  }

  async delete(id: number, storeId: number): Promise<void> {
    const category = await this.categoryRepository.findOne({
      where: { id, storeId },
    });

    if (!category) {
      throw new NotFoundException('카테고리를 찾을 수 없습니다.');
    }

    const menuCount = await this.menuRepository.count({
      where: { categoryId: id, storeId },
    });

    if (menuCount > 0) {
      throw new BadRequestException(
        '카테고리 내 메뉴가 존재하여 삭제할 수 없습니다',
      );
    }

    await this.categoryRepository.remove(category);
  }

  async reorder(
    storeId: number,
    dto: ReorderCategoriesDto,
  ): Promise<Category[]> {
    for (const item of dto.items) {
      await this.categoryRepository.update(
        { id: item.id, storeId },
        { displayOrder: item.displayOrder },
      );
    }

    return this.findAll(storeId);
  }
}
