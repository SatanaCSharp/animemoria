import { Type } from '@nestjs/common';
import { Maybe } from '@packages/shared-types/utils';
import { DataSource, ObjectLiteral, Repository } from 'typeorm';

export abstract class BaseRepository<TEntity extends ObjectLiteral> {
  protected constructor(
    protected dataSource: DataSource,
    protected entity: Type<TEntity>,
  ) {}

  protected get repository(): Repository<TEntity> {
    return this.dataSource.getRepository<TEntity>(this.entity);
  }

  findById(id: TEntity['id']): Promise<Maybe<TEntity>> {
    return this.repository.findOne({ where: { id } });
  }
}
