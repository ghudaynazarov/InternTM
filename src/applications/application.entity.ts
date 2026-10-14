import { Column, Entity, JoinColumn, ManyToOne, Relation, Unique } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { ApplicationStatus } from '../common/enums';
import { Internship } from '../internships/internship.entity';
import { User } from '../users/user.entity';

@Entity('applications')
@Unique(['userId', 'internshipId'])
export class Application extends AbstractEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => Internship, (i) => i.applications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internshipId' })
  internship: Relation<Internship>;

  // Step 1 "Basic Info"
  @Column() fullName: string;
  @Column() email: string;
  @Column() phone: string;
  @Column({ type: 'varchar', nullable: true }) linkedinUrl?: string;
  @Column({ type: 'varchar', nullable: true }) githubUrl?: string;

  // Step 2 "Documents"
  @Column({ type: 'varchar', nullable: true }) resumeUrl?: string;
  @Column({ type: 'text', nullable: true }) coverLetter?: string;

  @Column({ type: 'enum', enum: ApplicationStatus, default: ApplicationStatus.APPLIED })
  status: ApplicationStatus;

  /** Internal note visible only to admins */
  @Column({ type: 'text', nullable: true })
  adminNote?: string;
}
