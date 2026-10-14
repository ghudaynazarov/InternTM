import { Column, Entity, Index, JoinColumn, ManyToOne, Relation } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';
import { MessageSender } from '../common/enums';
import { Conversation } from './conversation.entity';

@Entity('messages')
export class Message extends AbstractEntity {
  @Index()
  @Column({ type: 'uuid' })
  conversationId: string;

  @ManyToOne(() => Conversation, (c) => c.messages, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'conversationId' })
  conversation: Relation<Conversation>;

  @Column({ type: 'enum', enum: MessageSender })
  sender: MessageSender;

  @Column({ type: 'text' })
  body: string;

  @Column({ default: false })
  isRead: boolean;
}
