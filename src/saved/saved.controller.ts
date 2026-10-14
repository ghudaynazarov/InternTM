import { Controller, Delete, Get, HttpCode, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { SavedService } from './saved.service';

@ApiTags('Saved')
@ApiBearerAuth()
@Controller('saved')
export class SavedController {
  constructor(private readonly service: SavedService) {}

  @Get()
  list(@CurrentUser() user: AuthUser, @Query() p: PaginationDto) {
    return this.service.list(user.id, p);
  }

  @HttpCode(200) @Post(':internshipId')
  save(@CurrentUser() user: AuthUser, @Param('internshipId', ParseUUIDPipe) id: string) {
    return this.service.save(user.id, id);
  }

  @Delete(':internshipId')
  unsave(@CurrentUser() user: AuthUser, @Param('internshipId', ParseUUIDPipe) id: string) {
    return this.service.unsave(user.id, id);
  }
}
