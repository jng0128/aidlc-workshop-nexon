import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { TableLoginDto } from './dto/table-login.dto';
import { LoginResponseDto } from './dto/login-response.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('admin/login')
  async adminLogin(@Body() dto: AdminLoginDto): Promise<LoginResponseDto> {
    return this.authService.adminLogin(dto);
  }

  @Post('table/login')
  async tableLogin(@Body() dto: TableLoginDto): Promise<LoginResponseDto> {
    return this.authService.tableLogin(dto);
  }
}
