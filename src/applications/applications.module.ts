import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Internship } from '../internships/internship.entity';
import { MessagesModule } from '../messages/messages.module';
import { Application } from './application.entity';
import { ApplicationsController } from './applications.controller';
import { ApplicationsService } from './applications.service';

@Module({
  imports: [TypeOrmModule.forFeature([Application, Internship]), MessagesModule],
  controllers: [ApplicationsController],
  providers: [ApplicationsService],
  exports: [ApplicationsService, TypeOrmModule],
})
export class ApplicationsModule {}
