import {
  Controller,
  Get,
  Post,
  Patch,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { TableService } from './table.service';
import { CreateTableDto, UpdateTableDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('tables')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TableController {
  constructor(private readonly tableService: TableService) {}

  @Get()
  @Roles(UserRole.ADMIN)
  findAll(@CurrentUser() user: any) {
    return this.tableService.findAll(user.storeId);
  }

  @Post()
  @Roles(UserRole.ADMIN)
  create(@CurrentUser() user: any, @Body() dto: CreateTableDto) {
    return this.tableService.create(user.storeId, dto);
  }

  @Patch(':id')
  @Roles(UserRole.ADMIN)
  update(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateTableDto,
  ) {
    return this.tableService.update(id, user.storeId, dto);
  }
}
