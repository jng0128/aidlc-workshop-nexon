import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';

import { MenuService } from './menu.service';
import { Menu } from '../entities/menu.entity';
import { Category } from '../entities/category.entity';

describe('MenuService', () => {
  let service: MenuService;
  let menuRepository: any;
  let categoryRepository: any;

  beforeEach(async () => {
    menuRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
      update: jest.fn(),
      createQueryBuilder: jest.fn(),
    };

    categoryRepository = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MenuService,
        { provide: getRepositoryToken(Menu), useValue: menuRepository },
        { provide: getRepositoryToken(Category), useValue: categoryRepository },
      ],
    }).compile();

    service = module.get<MenuService>(MenuService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should throw BadRequestException if categoryId is invalid', async () => {
      categoryRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(1, {
          name: '아메리카노',
          price: 4500,
          categoryId: 999,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should create menu with valid data', async () => {
      const category = { id: 1, name: '음료', storeId: 1 };
      categoryRepository.findOne.mockResolvedValue(category);

      const queryBuilder = {
        select: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ max: 1 }),
      };
      menuRepository.createQueryBuilder.mockReturnValue(queryBuilder);

      const newMenu = {
        id: 1,
        name: '아메리카노',
        price: 4500,
        categoryId: 1,
        displayOrder: 2,
        storeId: 1,
      };
      menuRepository.create.mockReturnValue(newMenu);
      menuRepository.save.mockResolvedValue(newMenu);

      const result = await service.create(1, {
        name: '아메리카노',
        price: 4500,
        categoryId: 1,
      });

      expect(result).toEqual(newMenu);
      expect(menuRepository.create).toHaveBeenCalledWith({
        name: '아메리카노',
        price: 4500,
        description: undefined,
        imageUrl: undefined,
        categoryId: 1,
        displayOrder: 2,
        storeId: 1,
      });
    });
  });

  describe('findAll', () => {
    it('should return menus filtered by categoryId', async () => {
      const menus = [
        { id: 1, name: '아메리카노', categoryId: 1, storeId: 1 },
      ];
      menuRepository.find.mockResolvedValue(menus);

      const result = await service.findAll(1, 1);

      expect(result).toEqual(menus);
      expect(menuRepository.find).toHaveBeenCalledWith({
        where: { storeId: 1, categoryId: 1 },
        relations: ['category'],
        order: { displayOrder: 'ASC' },
      });
    });

    it('should return all menus when no categoryId filter', async () => {
      const menus = [
        { id: 1, name: '아메리카노', categoryId: 1, storeId: 1 },
        { id: 2, name: '비빔밥', categoryId: 2, storeId: 1 },
      ];
      menuRepository.find.mockResolvedValue(menus);

      const result = await service.findAll(1);

      expect(result).toEqual(menus);
      expect(menuRepository.find).toHaveBeenCalledWith({
        where: { storeId: 1 },
        relations: ['category'],
        order: { displayOrder: 'ASC' },
      });
    });
  });

  describe('delete', () => {
    it('should throw NotFoundException if menu not found', async () => {
      menuRepository.findOne.mockResolvedValue(null);

      await expect(service.delete(999, 1)).rejects.toThrow(NotFoundException);
    });

    it('should delete menu successfully', async () => {
      const menu = { id: 1, name: '아메리카노', storeId: 1 };
      menuRepository.findOne.mockResolvedValue(menu);

      await service.delete(1, 1);

      expect(menuRepository.remove).toHaveBeenCalledWith(menu);
    });
  });
});
