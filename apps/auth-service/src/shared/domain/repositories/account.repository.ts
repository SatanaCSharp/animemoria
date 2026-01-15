import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@packages/nest-shared/orm';
import { Account } from 'shared/domain/entities/account.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class AccountRepository extends BaseRepository<Account> {
  constructor(dataSource: DataSource) {
    super(dataSource, Account);
  }
}
