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
import { OrderService } from './order.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @Roles(UserRole.TABLE)
  create(@CurrentUser() user: any, @Body() dto: CreateOrderDto) {
    return this.orderService.create(user.tableId, user.storeId, dto);
  }

  @Get()
  @Roles(UserRole.ADMIN, UserRole.TABLE)
  findOrders(
    @Query('sessionId') sessionId?: string,
    @Query('tableId') tableId?: string,
  ) {
    if (sessionId) {
      return this.orderService.findBySession(Number(sessionId));
    }
    if (tableId) {
      return this.orderService.findByTable(Number(tableId));
    }
    return [];
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN)
  updateStatus(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser() user: any,
    @Body() dto: UpdateOrderStatusDto,
  ) {
    return this.orderService.updateStatus(id, user.storeId, dto.status);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN)
  delete(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: any) {
    return this.orderService.delete(id, user.storeId);
  }
}
