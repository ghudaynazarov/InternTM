import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { StatsService } from './stats.service';

@ApiTags('Stats')
@Controller()
export class StatsController {
  constructor(private readonly service: StatsService) {}

  @Public() @Get('stats')
  publicStats() {
    return this.service.publicStats();
  }

  @ApiBearerAuth() @Get('dashboard')
  dashboard(@CurrentUser() user: AuthUser) {
    return this.service.dashboard(user.id);
  }
}
