import { Column, Entity, JoinColumn, ManyToOne, Relation, Unique } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { Internship } from '../internships/internship.entity';
import { User } from '../users/user.entity';

@Entity('saved_internships')
@Unique(['userId', 'internshipId'])
export class SavedInternship extends AbstractEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ type: 'uuid' })
  internshipId: string;

  @ManyToOne(() => Internship, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'internshipId' })
  internship: Relation<Internship>;
}
