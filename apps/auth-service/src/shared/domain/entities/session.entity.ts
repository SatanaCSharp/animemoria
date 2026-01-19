import { BaseEntity } from '@packages/nest-shared/orm';
import { Maybe } from '@packages/shared-types/utils';
import { Account } from 'shared/domain/entities/account.entity';
import { AppType } from 'shared/types/app-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity()
export class Session extends BaseEntity {
  constructor(args?: Partial<Session>) {
    super();
    if (typeof args !== 'undefined') {
      Object.assign(this, args);
    }
  }
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ nullable: true })
  refreshTokenHash: Maybe<string>;

  @Column('enum', { enum: AppType })
  appType!: AppType;

  @Column()
  accountId!: string;

  @ManyToOne(() => Account, (account) => account.sessions, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'accountId' })
  account!: Account;
}
