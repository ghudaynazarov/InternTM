import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/application.entity';
import { ApplicationStatus, Role } from '../common/enums';
import { Company } from '../companies/company.entity';
import { Internship } from '../internships/internship.entity';
import { MessagesService } from '../messages/messages.service';
import { SavedInternship } from '../saved/saved.entity';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
    @InjectRepository(Internship) private readonly internships: Repository<Internship>,
    @InjectRepository(Application) private readonly applications: Repository<Application>,
    @InjectRepository(SavedInternship) private readonly saved: Repository<SavedInternship>,
    private readonly messages: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  /** Numbers on the landing page (500+ opportunities, 120+ companies, 2000+ students, 85% hired). */
  async publicStats() {
    const [internships, companies, students, totalApps, accepted] = await Promise.all([
      this.internships.count({ where: { isActive: true } }),
      this.companies.count({ where: { isActive: true } }),
      this.users.count({ where: { role: Role.STUDENT } }),
      this.applications.count(),
      this.applications.count({ where: { status: ApplicationStatus.ACCEPTED } }),
    ]);
    return {
      internships,
      companies,
      students,
      hiredPercent: totalApps ? Math.round((accepted / totalApps) * 100) : 0,
    };
  }

  /** "Welcome back" dashboard. */
  async dashboard(userId: string) {
    const [user, applications, saved, unread, recent] = await Promise.all([
      this.usersService.getOrFail(userId),
      this.applications.count({ where: { userId } }),
      this.saved.count({ where: { userId } }),
      this.messages.unreadForUser(userId),
      this.applications.find({
        where: { userId },
        relations: { internship: { company: true } },
        order: { createdAt: 'DESC' },
        take: 5,
      }),
    ]);
    return {
      fullName: user.fullName,
      applications,
      savedJobs: saved,
      messages: unread,
      profileCompletion: this.usersService.profileCompletion(user),
      recentApplications: recent.map((a) => ({
        id: a.id,
        status: a.status,
        appliedAt: a.createdAt,
        internship: { id: a.internship.id, title: a.internship.title },
        company: { id: a.internship.company.id, name: a.internship.company.name, logoUrl: a.internship.company.logoUrl },
      })),
    };
  }

  /** Admin panel overview. */
  async adminOverview() {
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
    const [users, students, companies, internships, activeInternships, applications, newUsers, byStatusRaw, recent, topRaw] =
      await Promise.all([
        this.users.count(),
        this.users.count({ where: { role: Role.STUDENT } }),
        this.companies.count(),
        this.internships.count(),
        this.internships.count({ where: { isActive: true } }),
        this.applications.count(),
        this.users.createQueryBuilder('u').where('u.createdAt >= :since', { since }).getCount(),
        this.applications.createQueryBuilder('a').select('a.status', 'status').addSelect('COUNT(*)', 'count').groupBy('a.status').getRawMany(),
        this.applications.find({ relations: { user: true, internship: { company: true } }, order: { createdAt: 'DESC' }, take: 10 }),
        this.internships
          .createQueryBuilder('i')
          .leftJoin('i.company', 'c')
          .select(['i.id AS id', 'i.title AS title', 'c.name AS company', 'i.viewsCount AS views'])
          .orderBy('i.viewsCount', 'DESC')
          .limit(5)
          .getRawMany(),
      ]);
    const applicationsByStatus = Object.values(ApplicationStatus).reduce(
      (acc, s) => ({ ...acc, [s]: Number(byStatusRaw.find((r) => r.status === s)?.count ?? 0) }),
      {} as Record<string, number>,
    );
    return {
      totals: { users, students, companies, internships, activeInternships, applications, newUsersLast30Days: newUsers },
      applicationsByStatus,
      topInternships: topRaw.map((r) => ({ ...r, views: Number(r.views) })),
      recentApplications: recent.map((a) => ({
        id: a.id,
        status: a.status,
        createdAt: a.createdAt,
        student: { id: a.user.id, fullName: a.user.fullName, email: a.user.email },
        internship: a.internship.title,
        company: a.internship.company.name,
      })),
    };
  }
}
