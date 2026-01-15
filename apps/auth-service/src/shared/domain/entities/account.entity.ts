import { BaseEntity } from '@packages/nest-shared/orm';
import { AccountStatus } from '@packages/shared-types/enums';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

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

  @Column()
  status!: AccountStatus;

  @Column()
  password!: string;
}
