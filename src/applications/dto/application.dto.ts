import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, IsUrl, IsUUID, MaxLength } from 'class-validator';
import { ApplicationStatus } from '../../common/enums';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class ApplyDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(120) fullName: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(30) phone: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedinUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() githubUrl?: string;
  @ApiPropertyOptional({ description: 'URL returned by POST /uploads/resume' }) @IsOptional() @IsString() resumeUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(5000) coverLetter?: string;
}

export class UpdateApplicationStatusDto {
  @ApiProperty({ enum: ApplicationStatus }) @IsEnum(ApplicationStatus) status: ApplicationStatus;
  @ApiPropertyOptional() @IsOptional() @IsString() adminNote?: string;
  @ApiPropertyOptional({ description: 'Also send this text to the student as a chat message from the company' })
  @IsOptional() @IsString() @MaxLength(4000) message?: string;
}

export class QueryMyApplicationsDto extends PaginationDto {
  @ApiPropertyOptional({ enum: ApplicationStatus }) @IsOptional() @IsEnum(ApplicationStatus) status?: ApplicationStatus;
}

export class QueryAdminApplicationsDto extends QueryMyApplicationsDto {
  @ApiPropertyOptional() @IsOptional() @IsUUID() internshipId?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() search?: string;
}
