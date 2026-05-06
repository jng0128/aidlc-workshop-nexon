import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { SessionService } from './session.service';
import { SessionHistoryQueryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/user-role.enum';

@Controller('sessions')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SessionController {
  constructor(private readonly sessionService: SessionService) {}

  @Get('current')
  @Roles(UserRole.TABLE)
  getCurrentSession(@CurrentUser() user: any) {
    return this.sessionService.getCurrentSession(user.tableId);
  }

  @Post(':tableId/complete')
  @Roles(UserRole.ADMIN)
  completeSession(@Param('tableId', ParseIntPipe) tableId: number) {
    return this.sessionService.completeSession(tableId);
  }

  @Get(':tableId/history')
  @Roles(UserRole.ADMIN)
  getHistory(
    @Param('tableId', ParseIntPipe) tableId: number,
    @Query() query: SessionHistoryQueryDto,
  ) {
    return this.sessionService.getHistory(
      tableId,
      query.startDate,
      query.endDate,
    );
  }
}
