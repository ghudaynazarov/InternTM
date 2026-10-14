import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength,
} from 'class-validator';
import { ExperienceLevel, InternshipType } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class CreateInternshipDto {
  @ApiProperty({ example: 'Frontend Developer Intern' }) @IsString() @IsNotEmpty() @MaxLength(160) title: string;
  @ApiProperty() @IsString() @IsNotEmpty() description: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) responsibilities?: string[];
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) requirements?: string[];
  @ApiPropertyOptional({ type: [String], example: ['React', 'TypeScript'] }) @IsOptional() @IsArray() @IsString({ each: true }) skills?: string[];
  @ApiProperty({ example: 'Ashgabat' }) @IsString() @IsNotEmpty() location: string;
  @ApiProperty({ enum: InternshipType }) @IsEnum(InternshipType) type: InternshipType;
  @ApiProperty({ enum: ExperienceLevel }) @IsEnum(ExperienceLevel) experienceLevel: ExperienceLevel;
  @ApiPropertyOptional({ example: '3 months' }) @IsOptional() @IsString() duration?: string;
  @ApiPropertyOptional() @IsOptional() @Type(() => Date) @IsDate() deadline?: Date;
  @ApiProperty() @IsUUID() companyId: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isActive?: boolean;
}
export class UpdateInternshipDto extends PartialType(CreateInternshipDto) {}

const csv = ({ value }) => (typeof value === 'string' ? value.split(',').map((v) => v.trim()).filter(Boolean) : value);

export class QueryInternshipsDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Matches title, company, location, skills' }) @IsOptional() @IsString() search?: string;
  @ApiPropertyOptional({ description: 'Exact city, e.g. Ashgabat' }) @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() categoryId?: string;
  @ApiPropertyOptional() @IsOptional() @IsUUID() companyId?: string;
  @ApiPropertyOptional({ description: 'Comma separated: remote,on_site,hybrid' })
  @IsOptional() @Transform(csv) @IsEnum(InternshipType, { each: true }) type?: InternshipType[];
  @ApiPropertyOptional({ description: 'Comma separated: beginner,intermediate' })
  @IsOptional() @Transform(csv) @IsEnum(ExperienceLevel, { each: true }) level?: ExperienceLevel[];
  @ApiPropertyOptional({ enum: ['recent', 'oldest', 'popular'], default: 'recent' })
  @IsOptional() @IsEnum(['recent', 'oldest', 'popular']) sort?: 'recent' | 'oldest' | 'popular' = 'recent';
}
