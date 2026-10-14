import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageSender } from '../common/enums';
import { PaginationDto, paginated } from '../common/dto/pagination.dto';
import { Company } from '../companies/company.entity';
import { Conversation } from './conversation.entity';
import { Message } from './message.entity';

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(Conversation) private readonly convs: Repository<Conversation>,
    @InjectRepository(Message) private readonly msgs: Repository<Message>,
    @InjectRepository(Company) private readonly companies: Repository<Company>,
  ) {}

  private async decorate(list: Conversation[], unreadFrom: MessageSender) {
    for (const c of list) {
      c.lastMessage = await this.msgs.findOne({ where: { conversationId: c.id }, order: { createdAt: 'DESC' } });
      c.unreadCount = await this.msgs.count({ where: { conversationId: c.id, sender: unreadFrom, isRead: false } });
    }
    return list;
  }

  private async findOrCreate(userId: string, companyId: string) {
    let conv = await this.convs.findOne({ where: { userId, companyId } });
    if (!conv) conv = await this.convs.save(this.convs.create({ userId, companyId }));
    return conv;
  }

  private async push(conv: Conversation, sender: MessageSender, body: string) {
    const message = await this.msgs.save(this.msgs.create({ conversationId: conv.id, sender, body }));
    await this.convs.update(conv.id, { lastMessageAt: new Date() });
    return message;
  }

  // ---------- student side ----------
  async listForUser(userId: string, search?: string) {
    const qb = this.convs
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.company', 'company')
      .where('c.userId = :userId', { userId })
      .orderBy('c.lastMessageAt', 'DESC');
    if (search) qb.andWhere('company.name ILIKE :s', { s: `%${search}%` });
    return this.decorate(await qb.getMany(), MessageSender.COMPANY);
  }

  private async ownConversation(userId: string, id: string) {
    const conv = await this.convs.findOne({ where: { id }, relations: { company: true } });
    if (!conv) throw new NotFoundException('Conversation not found');
    if (conv.userId !== userId) throw new ForbiddenException();
    return conv;
  }

  async getForUser(userId: string, id: string, p: PaginationDto) {
    const conv = await this.ownConversation(userId, id);
    await this.msgs.update({ conversationId: id, sender: MessageSender.COMPANY, isRead: false }, { isRead: true });
    const [items, total] = await this.msgs.findAndCount({
      where: { conversationId: id },
      order: { createdAt: 'ASC' },
      skip: (p.page - 1) * p.limit,
      take: p.limit,
    });
    return { conversation: conv, ...paginated(items, total, p) };
  }

  async sendAsUser(userId: string, id: string, body: string) {
    const conv = await this.ownConversation(userId, id);
    return this.push(conv, MessageSender.USER, body);
  }

  async start(userId: string, companyId: string, body: string) {
    if (!(await this.companies.findOne({ where: { id: companyId } }))) throw new NotFoundException('Company not found');
    const conv = await this.findOrCreate(userId, companyId);
    const message = await this.push(conv, MessageSender.USER, body);
    return { conversationId: conv.id, message };
  }

  unreadForUser(userId: string) {
    return this.msgs
      .createQueryBuilder('m')
      .innerJoin('m.conversation', 'c')
      .where('c.userId = :userId', { userId })
      .andWhere('m.sender = :s', { s: MessageSender.COMPANY })
      .andWhere('m.isRead = false')
      .getCount();
  }

  // ---------- system / company side ----------
  async sendAsCompany(userId: string, companyId: string, body: string) {
    const conv = await this.findOrCreate(userId, companyId);
    return this.push(conv, MessageSender.COMPANY, body);
  }

  async adminList(p: PaginationDto & { search?: string }) {
    const qb = this.convs
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.company', 'company')
      .leftJoinAndSelect('c.user', 'user')
      .orderBy('c.lastMessageAt', 'DESC');
    if (p.search) qb.andWhere('(company.name ILIKE :s OR user.fullName ILIKE :s)', { s: `%${p.search}%` });
    qb.skip((p.page - 1) * p.limit).take(p.limit);
    const [items, total] = await qb.getManyAndCount();
    return paginated(await this.decorate(items, MessageSender.USER), total, p);
  }

  async adminGet(id: string, p: PaginationDto) {
    const conv = await this.convs.findOne({ where: { id }, relations: { company: true, user: true } });
    if (!conv) throw new NotFoundException('Conversation not found');
    await this.msgs.update({ conversationId: id, sender: MessageSender.USER, isRead: false }, { isRead: true });
    const [items, total] = await this.msgs.findAndCount({
      where: { conversationId: id },
      order: { createdAt: 'ASC' },
      skip: (p.page - 1) * p.limit,
      take: p.limit,
    });
    return { conversation: conv, ...paginated(items, total, p) };
  }

  async adminReply(id: string, body: string) {
    const conv = await this.convs.findOne({ where: { id } });
    if (!conv) throw new NotFoundException('Conversation not found');
    return this.push(conv, MessageSender.COMPANY, body);
  }
}
