import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Mekan Amanov' }) @IsString() @IsNotEmpty() @MaxLength(120) fullName: string;
  @ApiProperty({ example: 'mekan@example.com' }) @IsEmail() email: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(64) password: string;
  @ApiPropertyOptional({ example: '+993 61 234567' }) @IsOptional() @IsString() @MaxLength(30) phone?: string;
}

export class LoginDto {
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty() @IsString() @IsNotEmpty() password: string;
}

export class RefreshDto {
  @ApiProperty() @IsString() @IsNotEmpty() refreshToken: string;
}

export class ChangePasswordDto {
  @ApiProperty() @IsString() @IsNotEmpty() currentPassword: string;
  @ApiProperty({ minLength: 8 }) @IsString() @MinLength(8) @MaxLength(64) newPassword: string;
}
