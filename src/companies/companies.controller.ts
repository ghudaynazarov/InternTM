import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '../common/enums';
import { CompaniesService } from './companies.service';
import { CreateCompanyDto, QueryCompaniesDto, UpdateCompanyDto } from './dto/company.dto';

@ApiTags('Companies')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly service: CompaniesService) {}

  @Public() @Get()
  findAll(@Query() q: QueryCompaniesDto) {
    return this.service.findAll(q);
  }

  @Public() @Get('industries')
  industries() {
    return this.service.industries();
  }

  @Public() @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Get('admin/all')
  adminAll(@Query() q: QueryCompaniesDto) {
    return this.service.findAll(q, true);
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Post()
  create(@Body() dto: CreateCompanyDto) {
    return this.service.create(dto);
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCompanyDto) {
    return this.service.update(id, dto);
  }

  @ApiBearerAuth() @Roles(Role.ADMIN) @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.remove(id);
  }
}
