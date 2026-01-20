import { Injectable } from '@nestjs/common';
import { BaseRepository } from '@packages/nest-shared/orm';
import { Session } from 'shared/domain/entities/session.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class SessionRepository extends BaseRepository<Session> {
  constructor(dataSource: DataSource) {
    super(dataSource, Session);
  }

  async update(
    id: string,
    data: Partial<Pick<Session, 'refreshTokenHash'>>,
  ): Promise<void> {
    await this.repository.update(id, data);
  }
}
