import { BadRequestException, ConflictException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApplicationStatus } from '../common/enums';
import { paginated } from '../common/dto/pagination.dto';
import { Internship } from '../internships/internship.entity';
import { MessagesService } from '../messages/messages.service';
import { Application } from './application.entity';
import {
  ApplyDto, QueryAdminApplicationsDto, QueryMyApplicationsDto, UpdateApplicationStatusDto,
} from './dto/application.dto';

const STATUS_TEXT: Record<ApplicationStatus, (title: string) => string> = {
  [ApplicationStatus.APPLIED]: (t) => `We received your application for the ${t} position.`,
  [ApplicationStatus.UNDER_REVIEW]: (t) => `We have started reviewing your application for the ${t} position.`,
  [ApplicationStatus.ACCEPTED]: (t) => `Congratulations! Your application for the ${t} position has been accepted.`,
  [ApplicationStatus.REJECTED]: (t) => `Thank you for applying for the ${t} position. Unfortunately we won't move forward this time.`,
};

@Injectable()
export class ApplicationsService {
  constructor(
    @InjectRepository(Application) private readonly repo: Repository<Application>,
    @InjectRepository(Internship) private readonly internships: Repository<Internship>,
    private readonly messages: MessagesService,
  ) {}

  async apply(userId: string, internshipId: string, dto: ApplyDto) {
    const internship = await this.internships.findOne({ where: { id: internshipId }, relations: { company: true } });
    if (!internship || !internship.isActive) throw new NotFoundException('Internship not found');
    if (internship.deadline && internship.deadline < new Date()) throw new BadRequestException('Application deadline has passed');
    if (await this.repo.findOne({ where: { userId, internshipId } })) throw new ConflictException('You already applied to this internship');
    const app = await this.repo.save(this.repo.create({ ...dto, userId, internshipId }));
    return this.getMine(userId, app.id);
  }

  async listMine(userId: string, q: QueryMyApplicationsDto) {
    const [items, total] = await this.repo.findAndCount({
      where: { userId, ...(q.status ? { status: q.status } : {}) },
      relations: { internship: { company: true } },
      order: { createdAt: 'DESC' },
      skip: (q.page - 1) * q.limit,
      take: q.limit,
    });
    return paginated(items.map(({ adminNote, ...a }) => a), total, q);
  }

  async getMine(userId: string, id: string) {
    const app = await this.repo.findOne({ where: { id }, relations: { internship: { company: true } } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.userId !== userId) throw new ForbiddenException();
    const { adminNote, ...rest } = app;
    return rest;
  }

  async withdraw(userId: string, id: string) {
    const app = await this.repo.findOne({ where: { id } });
    if (!app) throw new NotFoundException('Application not found');
    if (app.userId !== userId) throw new ForbiddenException();
    if (app.status !== ApplicationStatus.APPLIED) throw new BadRequestException('Only new applications can be withdrawn');
    await this.repo.remove(app);
    return { deleted: true };
  }

  // ---------- admin ----------
  async adminList(q: QueryAdminApplicationsDto) {
    const qb = this.repo
      .createQueryBuilder('a')
      .leftJoinAndSelect('a.user', 'user')
      .leftJoinAndSelect('a.internship', 'internship')
      .leftJoinAndSelect('internship.company', 'company')
      .orderBy('a.createdAt', 'DESC');
    if (q.status) qb.andWhere('a.status = :st', { st: q.status });
    if (q.internshipId) qb.andWhere('a.internshipId = :iid', { iid: q.internshipId });
    if (q.search)
      qb.andWhere('(a.fullName ILIKE :s OR a.email ILIKE :s OR internship.title ILIKE :s OR company.name ILIKE :s)', {
        s: `%${q.search}%`,
      });
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginated(items, total, q);
  }

  async adminGet(id: string) {
    const app = await this.repo.findOne({ where: { id }, relations: { user: true, internship: { company: true } } });
    if (!app) throw new NotFoundException('Application not found');
    return app;
  }

  async adminUpdateStatus(id: string, dto: UpdateApplicationStatusDto) {
    const app = await this.adminGet(id);
    const changed = app.status !== dto.status;
    app.status = dto.status;
    if (dto.adminNote !== undefined) app.adminNote = dto.adminNote;
    await this.repo.save(app);
    // Tell the student in the Messages tab.
    if (dto.message || changed) {
      const body = dto.message ?? STATUS_TEXT[dto.status](app.internship.title);
      await this.messages.sendAsCompany(app.userId, app.internship.companyId, body);
    }
    return this.adminGet(id);
  }

  async adminRemove(id: string) {
    const app = await this.adminGet(id);
    await this.repo.remove(app);
    return { deleted: true };
  }
}
