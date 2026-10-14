import {
  Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { OptionalJwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CreateInternshipDto, QueryInternshipsDto, UpdateInternshipDto } from './dto/internship.dto';
import { InternshipsService } from './internships.service';

@ApiTags('Internships')
@Controller('internships')
export class InternshipsController {
  constructor(private readonly service: InternshipsService) {}

  /** Public list with filters (location, category, type, level), search and sort. Token optional -> adds isSaved. */
  @Public() @UseGuards(OptionalJwtAuthGuard) @Get()
  findAll(@Query() q: QueryInternshipsDto, @CurrentUser() user: AuthUser | null) {
    return this.service.findAll(q, user?.id);
  }

  @Public() @Get('meta/locations')
  locations() {
    return this.service.locations();
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Get('admin/all')
  adminAll(@Query() q: QueryInternshipsDto) {
    return this.service.findAll(q, undefined, true);
  }

  @Public() @UseGuards(OptionalJwtAuthGuard) @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: AuthUser | null) {
    return this.service.findOne(id, user?.id, true);
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Post()
  create(@Body() dto: CreateInternshipDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateInternshipDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
