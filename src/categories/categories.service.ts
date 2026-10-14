import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectRepository(Category) private readonly repo: Repository<Category>) {}

  findAll() {
    return this.repo.find({ order: { name: 'ASC' } });
  }

  async create(dto: CreateCategoryDto) {
    if (await this.repo.findOne({ where: { name: dto.name } })) throw new ConflictException('Category already exists');
    return this.repo.save(this.repo.create(dto));
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Category not found');
    Object.assign(c, dto);
    return this.repo.save(c);
  }

  async remove(id: string) {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException('Category not found');
    await this.repo.remove(c);
    return { deleted: true };
  }
}
