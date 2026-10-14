import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsUUID, MaxLength } from 'class-validator';

export class SendMessageDto {
  @ApiProperty() @IsString() @IsNotEmpty() @MaxLength(4000) body: string;
}

export class StartConversationDto extends SendMessageDto {
  @ApiProperty() @IsUUID() companyId: string;
}
