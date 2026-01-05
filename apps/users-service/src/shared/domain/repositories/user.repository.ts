import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@packages/nest-shared/orm';
import { User } from 'shared/domain/entities/user.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(dataSource, User);
  }
}
