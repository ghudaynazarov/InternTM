import { Column, Entity, OneToMany } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { Internship } from '../internships/internship.entity';

@Entity('companies')
export class Company extends AbstractEntity {
  @Column({ unique: true })
  name: string;

  @Column({ type: 'varchar', nullable: true })
  logoUrl?: string;

  /** e.g. "Software Development", "Telecommunications", "Cybersecurity" */
  @Column({ type: 'varchar', nullable: true })
  industry?: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', nullable: true })
  website?: string;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  @Column({ default: true })
  isActive: boolean;

  @OneToMany(() => Internship, (i) => i.company)
  internships: Internship[];

  // computed
  internshipsCount?: number;
}
