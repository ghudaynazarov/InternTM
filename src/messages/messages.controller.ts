import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiQuery, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SendMessageDto, StartConversationDto } from './dto/message.dto';
import { MessagesService } from './messages.service';

@ApiTags('Messages')
@ApiBearerAuth()
@Controller('messages')
export class MessagesController {
  constructor(private readonly service: MessagesService) {}

  @ApiQuery({ name: 'search', required: false })
  @Get('conversations')
  list(@CurrentUser() user: AuthUser, @Query('search') search?: string) {
    return this.service.listForUser(user.id, search);
  }

  @Get('unread-count')
  async unread(@CurrentUser() user: AuthUser) {
    return { unread: await this.service.unreadForUser(user.id) };
  }

  @Post('conversations')
  start(@CurrentUser() user: AuthUser, @Body() dto: StartConversationDto) {
    return this.service.start(user.id, dto.companyId, dto.body);
  }

  @Get('conversations/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Query() p: PaginationDto) {
    return this.service.getForUser(user.id, id, p);
  }

  @Post('conversations/:id/messages')
  send(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: SendMessageDto) {
    return this.service.sendAsUser(user.id, id, dto.body);
  }
}
