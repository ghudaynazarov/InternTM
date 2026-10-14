import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './admin/admin.module';
import { ApplicationsModule } from './applications/applications.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { CompaniesModule } from './companies/companies.module';
import { InternshipsModule } from './internships/internships.module';
import { MessagesModule } from './messages/messages.module';
import { SavedModule } from './saved/saved.module';
import { SeedService } from './seed/seed.service';
import { StatsModule } from './stats/stats.module';
import { UploadsModule } from './uploads/uploads.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{ ttl: 60_000, limit: 120 }]),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (c: ConfigService) => ({
        type: 'postgres',
        host: c.get('DB_HOST', 'localhost'),
        port: parseInt(c.get('DB_PORT', '5432'), 10),
        username: c.get('DB_USER', 'postgres'),
        password: c.get('DB_PASSWORD', 'postgres'),
        database: c.get('DB_NAME', 'interntm'),
        autoLoadEntities: true,
        synchronize: c.get('DB_SYNC') === 'true',
      }),
    }),
    UsersModule,
    AuthModule,
    CategoriesModule,
    CompaniesModule,
    InternshipsModule,
    ApplicationsModule,
    SavedModule,
    MessagesModule,
    StatsModule,
    AdminModule,
    UploadsModule,
  ],
  providers: [
    SeedService,
    // Order matters: throttle -> authenticate (JWT) -> authorize (roles)
    { provide: APP_GUARD, useClass: ThrottlerGuard },
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
})
export class AppModule {}
