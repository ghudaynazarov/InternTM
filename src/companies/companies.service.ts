import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { paginated } from '../common/dto/pagination.dto';
import { Company } from './company.entity';
import { CreateCompanyDto, QueryCompaniesDto, UpdateCompanyDto } from './dto/company.dto';

@Injectable()
export class CompaniesService {
  constructor(@InjectRepository(Company) private readonly repo: Repository<Company>) {}

  async findAll(q: QueryCompaniesDto, includeInactive = false) {
    const qb = this.repo
      .createQueryBuilder('company')
      .loadRelationCountAndMap('company.internshipsCount', 'company.internships', 'i', (sub) =>
        sub.andWhere('i.isActive = true'),
      )
      .orderBy('company.name', 'ASC');
    if (!includeInactive) qb.andWhere('company.isActive = true');
    if (q.search) qb.andWhere('company.name ILIKE :s', { s: `%${q.search}%` });
    if (q.industry) qb.andWhere('company.industry = :ind', { ind: q.industry });
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginated(items, total, q);
  }

  async industries() {
    const rows = await this.repo
      .createQueryBuilder('c')
      .select('DISTINCT c.industry', 'industry')
      .where('c.industry IS NOT NULL AND c.isActive = true')
      .orderBy('c.industry')
      .getRawMany();
    return rows.map((r) => r.industry);
  }

  async findOne(id: string) {
    const c = await this.repo
      .createQueryBuilder('company')
      .loadRelationCountAndMap('company.internshipsCount', 'company.internships', 'i', (sub) =>
        sub.andWhere('i.isActive = true'),
      )
      .where('company.id = :id', { id })
      .getOne();
    if (!c) throw new NotFoundException('Company not found');
    return c;
  }

  async create(dto: CreateCompanyDto) {
    if (await this.repo.findOne({ where: { name: dto.name } })) throw new ConflictException('Company name already exists');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateCompanyDto) {
    const c = await this.findOne(id);
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string) {
    const c = await this.findOne(id);
    await this.repo.remove(c);
    return { deleted: true };
  }
}
