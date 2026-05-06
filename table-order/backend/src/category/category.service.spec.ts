import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, BadRequestException, NotFoundException } from '@nestjs/common';

import { CategoryService } from './category.service';
import { Category } from '../entities/category.entity';
import { Menu } from '../entities/menu.entity';

describe('CategoryService', () => {
  let service: CategoryService;
  let categoryRepository: any;
  let menuRepository: any;

  beforeEach(async () => {
    categoryRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    menuRepository = {
      count: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryService,
        { provide: getRepositoryToken(Category), useValue: categoryRepository },
        { provide: getRepositoryToken(Menu), useValue: menuRepository },
      ],
    }).compile();

    service = module.get<CategoryService>(CategoryService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return categories ordered by displayOrder', async () => {
      const categories = [
        { id: 1, name: '음료', displayOrder: 0, storeId: 1 },
        { id: 2, name: '식사', displayOrder: 1, storeId: 1 },
      ];
      categoryRepository.find.mockResolvedValue(categories);

      const result = await service.findAll(1);

      expect(result).toEqual(categories);
      expect(categoryRepository.find).toHaveBeenCalledWith({
        where: { storeId: 1 },
        order: { displayOrder: 'ASC' },
      });
    });
  });

  describe('create', () => {
    it('should throw ConflictException if duplicate name exists', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue({ id: 1, name: '음료' }),
      };
      categoryRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      await expect(
        service.create(1, { name: '음료' }),
      ).rejects.toThrow(ConflictException);
    });

    it('should create category with auto displayOrder when not provided', async () => {
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        getOne: jest.fn().mockResolvedValue(null),
        getRawOne: jest.fn().mockResolvedValue({ max: 2 }),
      };
      categoryRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const newCategory = { id: 1, name: '음료', displayOrder: 3, storeId: 1 };
      categoryRepository.create.mockReturnValue(newCategory);
      categoryRepository.save.mockResolvedValue(newCategory);

      const result = await service.create(1, { name: '음료' });

      expect(result).toEqual(newCategory);
      expect(categoryRepository.create).toHaveBeenCalledWith({
        name: '음료',
        displayOrder: 3,
        storeId: 1,
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if category not found', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException if menus exist in category', async () => {
      categoryRepository.findOne.mockResolvedValue({
        id: 1,
        name: '음료',
        storeId: 1,
      });
      menuRepository.count.mockResolvedValue(3);

      await expect(service.delete(1, 1)).rejects.toThrow(BadRequestException);
    });

    it('should delete category when no menus exist', async () => {
      const category = { id: 1, name: '음료', storeId: 1 };
      categoryRepository.findOne.mockResolvedValue(category);
      menuRepository.count.mockResolvedValue(0);

      await service.delete(1, 1);

      expect(categoryRepository.remove).toHaveBeenCalledWith(category);
    });
  });
});
