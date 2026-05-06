import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { CreateMenuDto, UpdateMenuDto, ReorderMenusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('menus')
@UseGuards(JwtAuthGuard, RolesGuard)
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TABLE)
  findAll(
    @CurrentUser() user: any,
    @Query('categoryId') categoryId?: string,
  ) {
    const catId = categoryId ? parseInt(categoryId, 10) : undefined;
    return this.menuService.findAll(user.storeId, catId);
  }

  @Get(':id')
  @Roles(UserRole.ADMIN, UserRole.TABLE)
  findOne(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.menuService.findOne(id, user.storeId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() dto: CreateMenuDto) {
    return this.menuService.create(user.storeId, dto);
  }

  @Patch('reorder')
  @Roles(UserRole.ADMIN)
  reorder(@CurrentUser() user: any, @Body() dto: ReorderMenusDto) {
    return this.menuService.reorder(user.storeId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateMenuDto,
  ) {
    return this.menuService.update(id, user.storeId, dto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.menuService.delete(id, user.storeId);
  }
}
