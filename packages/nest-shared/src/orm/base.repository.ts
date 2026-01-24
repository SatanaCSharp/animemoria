import { Type } from '@nestjs/common';
import { Maybe } from '@packages/shared-types/utils';
import { DataSource, DeepPartial, ObjectLiteral, Repository } from 'typeorm';

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

  create(entity: DeepPartial<TEntity>): Promise<TEntity> {
    return this.repository.save(this.repository.create(entity));
  }
}
