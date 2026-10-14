import { Module } from '@nestjs/common';
import { ApplicationsModule } from '../applications/applications.module';
import { MessagesModule } from '../messages/messages.module';
import { StatsModule } from '../stats/stats.module';
import { UsersModule } from '../users/users.module';
import { AdminController } from './admin.controller';

@Module({
  imports: [UsersModule, ApplicationsModule, MessagesModule, StatsModule],
  controllers: [AdminController],
})
export class AdminModule {}
