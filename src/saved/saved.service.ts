import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginationDto, paginated } from '../common/dto/pagination.dto';
import { Internship } from '../internships/internship.entity';
import { SavedInternship } from './saved.entity';

@Injectable()
export class SavedService {
  constructor(
    @InjectRepository(SavedInternship) private readonly repo: Repository<SavedInternship>,
    @InjectRepository(Internship) private readonly internships: Repository<Internship>,
  ) {}

  async list(userId: string, p: PaginationDto) {
    const [rows, total] = await this.repo.findAndCount({
      where: { userId },
      relations: { internship: { company: true, category: true } },
      order: { createdAt: 'DESC' },
      skip: (p.page - 1) * p.limit,
      take: p.limit,
    });
    return paginated(rows.map((r) => ({ ...r.internship, isSaved: true, savedAt: r.createdAt })), total, p);
  }

  async save(userId: string, internshipId: string) {
    if (!(await this.internships.findOne({ where: { id: internshipId } }))) throw new NotFoundException('Internship not found');
    const existing = await this.repo.findOne({ where: { userId, internshipId } });
    if (!existing) await this.repo.save(this.repo.create({ userId, internshipId }));
    return { saved: true };
  }

  async unsave(userId: string, internshipId: string) {
    await this.repo.delete({ userId, internshipId });
    return { saved: false };
  }
}
