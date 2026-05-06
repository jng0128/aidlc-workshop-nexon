import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { HealthModule } from './health/health.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { MenuModule } from './menu/menu.module';
import { OrderModule } from './order/order.module';
import { SessionModule } from './session/session.module';
import { TableModule } from './table/table.module';
import { StoreModule } from './store/store.module';
import { SseModule } from './sse/sse.module';

@Module({
  imports: [
    // Configuration
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // Database
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 5432),
        username: configService.get<string>('DB_USERNAME', 'postgres'),
        password: configService.get<string>('DB_PASSWORD', 'postgres'),
        database: configService.get<string>('DB_DATABASE', 'table_order'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get<string>('NODE_ENV') !== 'production',
        logging: configService.get<string>('NODE_ENV') === 'development',
      }),
    }),

    // Common
    CommonModule,

    // Health check
    HealthModule,

    // Feature modules
    AuthModule,
    CategoryModule,
    MenuModule,
    OrderModule,
    SessionModule,
    TableModule,
    StoreModule,
    SseModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
