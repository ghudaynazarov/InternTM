import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Application } from '../applications/application.entity';
import { Category } from '../categories/category.entity';
import { Company } from '../companies/company.entity';
import { SavedInternship } from '../saved/saved.entity';
import { Internship } from './internship.entity';
import { InternshipsController } from './internships.controller';
import { InternshipsService } from './internships.service';

@Module({
  imports: [TypeOrmModule.forFeature([Internship, Company, Category, SavedInternship, Application])],
  controllers: [InternshipsController],
  providers: [InternshipsService],
  exports: [InternshipsService, TypeOrmModule],
})
export class InternshipsModule {}
