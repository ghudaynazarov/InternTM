import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: 'Backend' }) @IsString() @IsNotEmpty() @MaxLength(60) name: string;
}
export class UpdateCategoryDto extends PartialType(CreateCategoryDto) {}
