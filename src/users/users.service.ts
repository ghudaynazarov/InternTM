import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from '../common/enums';
import { PaginationDto, paginated } from '../common/dto/pagination.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { User } from './user.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly repo: Repository<User>) {}

  /** Percentage shown as "Profile complete" on the dashboard. */
  profileCompletion(u: User): number {
    const checks = [
      !!u.fullName,
      !!u.phone,
      !!u.avatarUrl,
      !!u.coverUrl,
      !!u.headline,
      !!u.about,
      !!u.location,
      (u.skills?.length ?? 0) > 0,
      !!u.githubUrl,
      !!u.linkedinUrl,
    ];
    return Math.round((checks.filter(Boolean).length / checks.length) * 100);
  }

  toProfile(u: User) {
    const { passwordHash, refreshTokenHash, ...rest } = u as any;
    return { ...rest, profileCompletion: this.profileCompletion(u) };
  }

  findByEmailWithSecrets(email: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
      .where('LOWER(u.email) = LOWER(:email)', { email })
      .getOne();
  }

  findByIdWithSecrets(id: string) {
    return this.repo
      .createQueryBuilder('u')
      .addSelect(['u.passwordHash', 'u.refreshTokenHash'])
      .where('u.id = :id', { id })
      .getOne();
  }

  findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  async getOrFail(id: string) {
    const u = await this.findById(id);
    if (!u) throw new NotFoundException('User not found');
    return u;
  }

  create(data: Partial<User>) {
    return this.repo.save(this.repo.create(data));
  }

  save(u: User) {
    return this.repo.save(u);
  }

  async updateProfile(id: string, dto: UpdateProfileDto) {
    const u = await this.getOrFail(id);
    Object.assign(u, dto);
    return this.toProfile(await this.repo.save(u));
  }

  // ----- admin -----
  async adminList(q: PaginationDto & { search?: string; role?: Role }) {
    const qb = this.repo.createQueryBuilder('u').orderBy('u.createdAt', 'DESC');
    if (q.search) qb.andWhere('(u.fullName ILIKE :s OR u.email ILIKE :s)', { s: `%${q.search}%` });
    if (q.role) qb.andWhere('u.role = :role', { role: q.role });
    qb.skip((q.page - 1) * q.limit).take(q.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginated(items.map((u) => this.toProfile(u)), total, q);
  }

  async adminUpdate(id: string, patch: { role?: Role; isActive?: boolean }) {
    const u = await this.getOrFail(id);
    if (patch.role !== undefined) u.role = patch.role;
    if (patch.isActive !== undefined) {
      u.isActive = patch.isActive;
      if (!patch.isActive) {
        const full = await this.findByIdWithSecrets(id);
        full.refreshTokenHash = null; // kill sessions
        await this.repo.save(full);
      }
    }
    return this.toProfile(await this.repo.save(u));
  }

  async adminRemove(id: string) {
    const u = await this.getOrFail(id);
    await this.repo.remove(u);
    return { deleted: true };
  }
}
