import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { Category } from '../categories/category.entity';
import { ExperienceLevel, InternshipType, Role } from '../common/enums';
import { Company } from '../companies/company.entity';
import { Internship } from '../internships/internship.entity';
import { User } from '../users/user.entity';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly log = new Logger('Seed');

  constructor(
    private readonly config: ConfigService,
    @InjectRepository(User) private readonly users: Repository<User>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
    @InjectRepository(Internship) private readonly internships: Repository<Internship>,
  ) {}

  async onApplicationBootstrap() {
    await this.seedAdmin();
    if (this.config.get('SEED_DEMO') === 'true') await this.seedDemo();
  }

  private async seedAdmin() {
    const email = this.config.get<string>('ADMIN_EMAIL')?.toLowerCase();
    const password = this.config.get<string>('ADMIN_PASSWORD');
    if (!email || !password) return this.log.warn('ADMIN_EMAIL / ADMIN_PASSWORD not set - skipping admin seed');
    if (await this.users.findOne({ where: { email } })) return;
    await this.users.save(
      this.users.create({
        email,
        fullName: this.config.get('ADMIN_NAME', 'Admin'),
        passwordHash: await bcrypt.hash(password, 12),
        role: Role.ADMIN,
      }),
    );
    this.log.log(`Admin account created: ${email}`);
  }

  private async seedDemo() {
    if ((await this.companies.count()) > 0) return;

    const cats: Record<string, Category> = {};
    for (const name of ['Backend', 'Frontend', 'Mobile', 'Data', 'DevOps', 'Cybersecurity', 'Design']) {
      cats[name] = await this.categories.save(this.categories.create({ name }));
    }

    const c = async (name: string, industry: string, description: string) =>
      this.companies.save(this.companies.create({ name, industry, description, location: 'Ashgabat' }));
    const asgabat = await c('Asgabat IT Solutions', 'Software Development', 'Asgabat IT Solutions is a leading software company in Turkmenistan, focusing on web and mobile solutions for local and international clients.');
    const telecom = await c('TurkmenTelecom', 'Telecommunications', 'National telecommunications provider.');
    const smart = await c('SmartApps TM', 'Mobile Development', 'Mobile product studio.');
    const mind = await c('DataMind TM', 'Data & Analytics', 'Data analytics and BI consultancy.');
    await c('CyberTech TM', 'Cybersecurity', 'Security audits and consulting.');
    await c('WebCreators', 'Web Development', 'Web agency building modern websites.');

    const mk = (o: Partial<Internship>) => this.internships.save(this.internships.create(o));
    await mk({
      title: 'Frontend Developer Intern', companyId: asgabat.id, categoryId: cats.Frontend.id,
      description: 'Join our product team and help build modern web interfaces.',
      responsibilities: ['Develop and maintain web applications', 'Work with React and modern frontend technologies', 'Collaborate with designers and backend developers', 'Participate in code reviews'],
      requirements: ['Basic knowledge of HTML, CSS, JavaScript', 'Familiarity with React (or willingness to learn)', 'Good problem-solving skills', 'English or Russian (basic level)'],
      skills: ['Frontend', 'React', 'TypeScript', 'UI/UX', 'Git'], location: 'Ashgabat', type: InternshipType.ON_SITE,
      experienceLevel: ExperienceLevel.BEGINNER, duration: '3 months',
    });
    await mk({
      title: 'Backend Developer Intern', companyId: telecom.id, categoryId: cats.Backend.id,
      description: 'Work on internal APIs and services.', responsibilities: ['Build REST APIs', 'Write database queries'],
      requirements: ['Basic Node.js knowledge', 'SQL basics'], skills: ['Node.js', 'NestJS', 'PostgreSQL'],
      location: 'Ashgabat', type: InternshipType.HYBRID, experienceLevel: ExperienceLevel.BEGINNER, duration: '3-6 months',
    });
    await mk({
      title: 'Mobile App Intern', companyId: smart.id, categoryId: cats.Mobile.id,
      description: 'Help build cross-platform mobile apps.', responsibilities: ['Implement screens in Flutter'],
      requirements: ['Dart or any OOP language'], skills: ['Flutter', 'Dart', 'Firebase'],
      location: 'Ashgabat', type: InternshipType.ON_SITE, experienceLevel: ExperienceLevel.BEGINNER, duration: '3 months',
    });
    await mk({
      title: 'Data Analyst Intern', companyId: mind.id, categoryId: cats.Data.id,
      description: 'Analyse data and build dashboards.', responsibilities: ['Clean datasets', 'Build Power BI reports'],
      requirements: ['SQL basics', 'Python basics'], skills: ['Python', 'SQL', 'Power BI'],
      location: 'Ashgabat', type: InternshipType.REMOTE, experienceLevel: ExperienceLevel.INTERMEDIATE, duration: '3 months',
    });
    this.log.log('Demo data inserted');
  }
}
