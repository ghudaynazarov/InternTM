import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { Role } from '../common/enums';

@Entity('users')
export class User extends AbstractEntity {
  @Column({ unique: true })
  email: string;

  @Column({ select: false })
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ type: 'varchar', nullable: true })
  phone?: string;

  @Column({ type: 'enum', enum: Role, default: Role.STUDENT })
  role: Role;

  @Column({ type: 'varchar', nullable: true })
  avatarUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  coverUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  location?: string;

  /** e.g. "Aspiring Backend Developer" */
  @Column({ type: 'varchar', nullable: true })
  headline?: string;

  @Column({ type: 'text', nullable: true })
  about?: string;

  @Column('text', { array: true, default: '{}' })
  skills: string[];

  @Column({ type: 'varchar', nullable: true })
  githubUrl?: string;

  @Column({ type: 'varchar', nullable: true })
  linkedinUrl?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'varchar', nullable: true, select: false })
  refreshTokenHash?: string;
}
