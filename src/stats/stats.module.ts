import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../applications/application.entity';
import { Company } from '../companies/company.entity';
import { Internship } from '../internships/internship.entity';
import { MessagesModule } from '../messages/messages.module';
import { SavedInternship } from '../saved/saved.entity';
import { UsersModule } from '../users/users.module';
import { StatsController } from './stats.controller';
import { StatsService } from './stats.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, Internship, Application, SavedInternship]),
    UsersModule,
    MessagesModule,
  ],
  controllers: [StatsController],
  providers: [StatsService],
  exports: [StatsService],
})
export class StatsModule {}
