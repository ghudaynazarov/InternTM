import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Internship } from '../internships/internship.entity';
import { SavedController } from './saved.controller';
import { SavedInternship } from './saved.entity';
import { SavedService } from './saved.service';

@Module({
  imports: [TypeOrmModule.forFeature([SavedInternship, Internship])],
  controllers: [SavedController],
  providers: [SavedService],
  exports: [TypeOrmModule],
})
export class SavedModule {}
