import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Relation } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { ExperienceLevel, InternshipType } from '../common/enums';
import { Application } from '../applications/application.entity';
import { Category } from '../categories/category.entity';
import { Company } from '../companies/company.entity';

@Entity('internships')
export class Internship extends AbstractEntity {
  @Column()
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('text', { array: true, default: '{}' })
  responsibilities: string[];

  @Column('text', { array: true, default: '{}' })
  requirements: string[];

  /** Tech tags shown as chips: React, TypeScript, Node.js ... */
  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column()
  location: string;

  @Column({ type: 'enum', enum: InternshipType, default: InternshipType.ON_SITE })
  type: InternshipType;

  @Column({ type: 'enum', enum: ExperienceLevel, default: ExperienceLevel.BEGINNER })
  experienceLevel: ExperienceLevel;

  /** Free text like "3 months" or "3-6 months" */
  @Column({ type: 'varchar', nullable: true })
  duration?: string;

  @Column({ type: 'timestamp', nullable: true })
  deadline?: Date;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, (c) => c.internships, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Relation<Company>;

  @Column({ type: 'uuid', nullable: true })
  categoryId?: string;

  @ManyToOne(() => Category, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'categoryId' })
  category?: Relation<Category>;

  @OneToMany(() => Application, (a) => a.internship)
  applications: Application[];

  // computed
  applicationsCount?: number;
  isSaved?: boolean;
  hasApplied?: boolean;
}
