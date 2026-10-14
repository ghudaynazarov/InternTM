import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Application } from '../applications/application.entity';
import { Category } from '../categories/category.entity';
import { paginated } from '../common/dto/pagination.dto';
import { Company } from '../companies/company.entity';
import { CreateInternshipDto, QueryInternshipsDto, UpdateInternshipDto } from './dto/internship.dto';
import { Internship } from './internship.entity';
import { SavedInternship } from '../saved/saved.entity';

@Injectable()
export class InternshipsService {
  constructor(
    @InjectRepository(Internship) private readonly repo: Repository<Internship>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
    @InjectRepository(Category) private readonly categories: Repository<Category>,
    @InjectRepository(SavedInternship) private readonly saved: Repository<SavedInternship>,
    @InjectRepository(Application) private readonly applications: Repository<Application>,
  ) {}

  async findAll(q: QueryInternshipsDto, userId?: string, includeInactive = false) {
    const qb = this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.company', 'company')
      .leftJoinAndSelect('i.category', 'category')
      .loadRelationCountAndMap('i.applicationsCount', 'i.applications');

    if (!includeInactive) qb.andWhere('i.isActive = true').andWhere('company.isActive = true');
    if (q.search)
      qb.andWhere(
        `(i.title ILIKE :s OR company.name ILIKE :s OR i.location ILIKE :s OR array_to_string(i.skills, ',') ILIKE :s)`,
        { s: `%${q.search}%` },
      );
    if (q.location) qb.andWhere('i.location ILIKE :loc', { loc: q.location });
    if (q.categoryId) qb.andWhere('i.categoryId = :cat', { cat: q.categoryId });
    if (q.companyId) qb.andWhere('i.companyId = :co', { co: q.companyId });
    if (q.type?.length) qb.andWhere('i.type IN (:...types)', { types: q.type });
    if (q.level?.length) qb.andWhere('i.experienceLevel IN (:...levels)', { levels: q.level });

    if (q.sort === 'oldest') qb.orderBy('i.createdAt', 'ASC');
    else if (q.sort === 'popular') qb.orderBy('i.viewsCount', 'DESC').addOrderBy('i.createdAt', 'DESC');
    else qb.orderBy('i.createdAt', 'DESC');

    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();

    if (userId && items.length) {
      const rows = await this.saved
        .createQueryBuilder('s')
        .select('s.internshipId', 'id')
        .where('s.userId = :userId', { userId })
        .andWhere('s.internshipId IN (:...ids)', { ids: items.map((i) => i.id) })
        .getRawMany();
      const savedIds = new Set(rows.map((r) => r.id));
      items.forEach((i) => (i.isSaved = savedIds.has(i.id)));
    } else {
      items.forEach((i) => (i.isSaved = false));
    }
    return paginated(items, total, q);
  }

  async locations() {
    const rows = await this.repo
      .createQueryBuilder('i')
      .select('DISTINCT i.location', 'location')
      .where('i.isActive = true')
      .orderBy('i.location')
      .getRawMany();
    return rows.map((r) => r.location);
  }

  /** Detail page. Increments the "Views" counter when `countView` is true. */
  async findOne(id: string, userId?: string, countView = false) {
    const item = await this.repo
      .createQueryBuilder('i')
      .leftJoinAndSelect('i.company', 'company')
      .leftJoinAndSelect('i.category', 'category')
      .loadRelationCountAndMap('i.applicationsCount', 'i.applications')
      .where('i.id = :id', { id })
      .getOne();
    if (!item) throw new NotFoundException('Internship not found');
    if (countView) {
      await this.repo.increment({ id }, 'viewsCount', 1);
      item.viewsCount += 1;
    }
    item.isSaved = false;
    item.hasApplied = false;
    if (userId) {
      item.isSaved = !!(await this.saved.findOne({ where: { userId, internshipId: id } }));
      item.hasApplied = !!(await this.applications.findOne({ where: { userId, internshipId: id } }));
    }
    return item;
  }

  private async assertRefs(companyId?: string, categoryId?: string) {
    if (companyId && !(await this.companies.findOne({ where: { id: companyId } })))
      throw new NotFoundException('Company not found');
    if (categoryId && !(await this.categories.findOne({ where: { id: categoryId } })))
      throw new NotFoundException('Category not found');
  }

  async create(dto: CreateInternshipDto) {
    await this.assertRefs(dto.companyId, dto.categoryId);
    const saved = await this.repo.save(this.repo.create(dto));
    return this.findOne(saved.id);
  }

  async update(id: string, dto: UpdateInternshipDto) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Internship not found');
    await this.assertRefs(dto.companyId, dto.categoryId);
    Object.assign(item, dto);
    await this.repo.save(item);
    return this.findOne(id);
  }

  async remove(id: string) {
    const item = await this.repo.findOne({ where: { id } });
    if (!item) throw new NotFoundException('Internship not found');
    await this.repo.remove(item);
    return { deleted: true };
  }
}
