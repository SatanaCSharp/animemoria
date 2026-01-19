import { BaseEntity } from '@packages/nest-shared/orm';
import { AccountStatus } from '@packages/shared-types/enums';
import { Session } from 'shared/domain/entities/session.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Account extends BaseEntity {
  constructor(args?: Partial<Account>) {
    super();
    if (typeof args !== 'undefined') {
      Object.assign(this, args);
    }
  }

  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  email!: string;

  @Column('enum', { enum: AccountStatus })
  status!: AccountStatus;

  @Column()
  password!: string;

  @OneToMany(() => Session, (session) => session.account)
  sessions!: Session[];
}
