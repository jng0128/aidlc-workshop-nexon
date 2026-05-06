import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto, UpdateCategoryDto, ReorderCategoriesDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('categories')
@UseGuards(JwtAuthGuard, RolesGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TABLE)
  findAll(@CurrentUser() user: any) {
    return this.categoryService.findAll(user.storeId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() dto: CreateCategoryDto) {
    return this.categoryService.create(user.storeId, dto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  reorder(@CurrentUser() user: any, @Body() dto: ReorderCategoriesDto) {
    return this.categoryService.reorder(user.storeId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateCategoryDto,
  ) {
    return this.categoryService.update(id, user.storeId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.categoryService.delete(id, user.storeId);
  }
}
