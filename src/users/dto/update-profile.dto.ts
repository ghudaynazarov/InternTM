import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsOptional, IsString, IsUrl, MaxLength } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) fullName?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(30) phone?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(120) location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(160) headline?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() @MaxLength(3000) about?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() @IsString({ each: true }) skills?: string[];
  @ApiPropertyOptional() @IsOptional() @IsUrl() githubUrl?: string;
  @ApiPropertyOptional() @IsOptional() @IsUrl() linkedinUrl?: string;
  @ApiPropertyOptional({ description: 'URL returned by POST /uploads/image' }) @IsOptional() @IsString() avatarUrl?: string;
  @ApiPropertyOptional({ description: 'URL returned by POST /uploads/image' }) @IsOptional() @IsString() coverUrl?: string;
}
