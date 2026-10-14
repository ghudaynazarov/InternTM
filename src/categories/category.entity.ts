import { Column, Entity } from 'typeorm';
import { AbstractEntity } from '../common/abstract.entity';

@Entity('categories')
export class Category extends AbstractEntity {
  @Column({ unique: true })
  name: string;
}
