import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from '../companies/company.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';
import { MessagesController } from './messages.controller';
import { MessagesService } from './messages.service';

@Module({
  imports: [TypeOrmModule.forFeature([Conversation, Message, Company])],
  controllers: [MessagesController],
  providers: [MessagesService],
  exports: [MessagesService, TypeOrmModule],
})
export class MessagesModule {}
