import { BaseEntity } from '@packages/nest-shared/orm';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('users')
export class User extends BaseEntity {
  constructor(args?: Partial<User>) {
    super();
    if (typeof args !== 'undefined') {
      Object.assign(this, args);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column()
  nickname!: string;

  @Column({ name: 'account_id' })
  accountId!: string;
}
