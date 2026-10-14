import { Column, Entity, JoinColumn, ManyToOne, OneToMany, Relation, Unique } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { Company } from '../companies/company.entity';
import { User } from '../users/user.entity';
import { Message } from './message.entity';

@Entity('conversations')
@Unique(['userId', 'companyId'])
export class Conversation extends AbstractEntity {
  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: Relation<User>;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => Company, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'companyId' })
  company: Relation<Company>;

  @Column({ type: 'timestamp', default: () => 'now()' })
  lastMessageAt: Date;

  @OneToMany(() => Message, (m) => m.conversation)
  messages: Message[];

  // computed
  lastMessage?: Message | null;
  unreadCount?: number;
}
