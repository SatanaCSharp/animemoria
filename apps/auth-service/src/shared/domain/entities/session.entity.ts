import { BaseEntity } from '@packages/nest-shared/orm';
import { Account } from 'shared/domain/entities/account.entity';
import { AppType } from 'shared/types/app-type.enum';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('sessions')
export class Session extends BaseEntity {
  constructor(args?: Partial<Session>) {
    super();
    if (typeof args !== 'undefined') {
      Object.assign(this, args);
    }
  }
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column('varchar', { name: 'refresh_token_hash', nullable: true })
  refreshTokenHash!: string | null;

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
