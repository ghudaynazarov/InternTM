import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { ApplicationsService } from './applications.service';
import { ApplyDto, QueryMyApplicationsDto } from './dto/application.dto';

@ApiTags('Applications')
@ApiBearerAuth()
@Controller()
export class ApplicationsController {
  constructor(private readonly service: ApplicationsService) {}

  /** "Apply for Frontend Developer Intern" form */
  @Post('internships/:id/apply')
  apply(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: ApplyDto) {
    return this.service.apply(user.id, id, dto);
  }

  @Get('applications')
  list(@CurrentUser() user: AuthUser, @Query() q: QueryMyApplicationsDto) {
    return this.service.listMine(user.id, q);
  }

  @Get('applications/:id')
  get(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.getMine(user.id, id);
  }

  @Delete('applications/:id')
  withdraw(@CurrentUser() user: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    return this.service.withdraw(user.id, id);
  }
}
