import { BadRequestException, Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { ApplicationsService } from '../applications/applications.service';
import { QueryAdminApplicationsDto, UpdateApplicationStatusDto } from '../applications/dto/application.dto';
import { AuthUser, CurrentUser } from '../common/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { PaginationDto } from '../common/dto/pagination.dto';
import { Role } from '../common/enums';
import { SendMessageDto } from '../messages/dto/message.dto';
import { MessagesService } from '../messages/messages.service';
import { StatsService } from '../stats/stats.service';
import { UsersService } from '../users/users.service';
import { QueryConversationsDto, QueryUsersDto, UpdateUserAdminDto } from './dto/admin.dto';

/**
 * Admin panel API. Everything here requires role = admin.
 * Company / internship / category management lives on their own controllers
 * (POST/PATCH/DELETE are admin-only there, plus `GET .../admin/all` lists including inactive).
 */
@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(
    private readonly stats: StatsService,
    private readonly users: UsersService,
    private readonly applications: ApplicationsService,
    private readonly messages: MessagesService,
  ) {}

  @Get('overview')
  overview() {
    return this.stats.adminOverview();
  }

  // ----- users -----
  @Get('users')
  listUsers(@Query() q: QueryUsersDto) {
    return this.users.adminList(q);
  }

  @Get('users/:id')
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    return this.users.toProfile(await this.users.getOrFail(id));
  }

  @Patch('users/:id')
  updateUser(@CurrentUser() me: AuthUser, @Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateUserAdminDto) {
    if (id === me.id && (dto.isActive === false || (dto.role && dto.role !== Role.ADMIN)))
      throw new BadRequestException("You can't disable or demote your own account");
    return this.users.adminUpdate(id, dto);
  }

  @Delete('users/:id')
  removeUser(@CurrentUser() me: AuthUser, @Param('id', ParseUUIDPipe) id: string) {
    if (id === me.id) throw new BadRequestException("You can't delete your own account");
    return this.users.adminRemove(id);
  }

  // ----- applications -----
  @Get('applications')
  listApplications(@Query() q: QueryAdminApplicationsDto) {
    return this.applications.adminList(q);
  }

  @Get('applications/:id')
  getApplication(@Param('id', ParseUUIDPipe) id: string) {
    return this.applications.adminGet(id);
  }

  /** Accept / reject / mark under review. Student is notified in Messages automatically. */
  @Patch('applications/:id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateApplicationStatusDto) {
    return this.applications.adminUpdateStatus(id, dto);
  }

  @Delete('applications/:id')
  removeApplication(@Param('id', ParseUUIDPipe) id: string) {
    return this.applications.adminRemove(id);
  }

  // ----- conversations (reply as a company) -----
  @Get('conversations')
  listConversations(@Query() q: QueryConversationsDto) {
    return this.messages.adminList(q);
  }

  @Get('conversations/:id')
  getConversation(@Param('id', ParseUUIDPipe) id: string, @Query() p: PaginationDto) {
    return this.messages.adminGet(id, p);
  }

  @Post('conversations/:id/messages')
  reply(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SendMessageDto) {
    return this.messages.adminReply(id, dto.body);
  }
}
