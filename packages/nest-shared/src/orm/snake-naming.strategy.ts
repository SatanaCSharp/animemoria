import { DefaultNamingStrategy, NamingStrategyInterface, Table } from 'typeorm';
import { snakeCase } from 'typeorm/util/StringUtils';

const transformTableColumns = (
  table: string | Table,
  columnNames: string[],
): string => {
  const tableName = typeof table === 'string' ? table : table.name;
  return `${snakeCase(tableName)}_${columnNames.map(snakeCase).join('_')}`;
};

export class SnakeNamingStrategy
  extends DefaultNamingStrategy
  implements NamingStrategyInterface
{
  override tableName(targetName: string, userSpecifiedName?: string): string {
    return userSpecifiedName ?? snakeCase(targetName);
  }

  override columnName(
    propertyName: string,
    customName: string,
    embeddedPrefixes: string[],
  ): string {
    return (
      snakeCase(embeddedPrefixes.concat('').join('_')) +
      (customName ? customName : snakeCase(propertyName))
    );
  }

  override relationName(propertyName: string): string {
    return snakeCase(propertyName);
  }

  override primaryKeyName(table: string | Table): string {
    const tableName = typeof table === 'string' ? table : table.name;
    return `PK_${snakeCase(tableName)}`;
  }
  override foreignKeyName(
    table: string | Table,
    columnNames: string[],
  ): string {
    return `FK_${transformTableColumns(table, columnNames)}`;
  }
  override indexName(table: string | Table, columnNames: string[]): string {
    return `INDEX_${transformTableColumns(table, columnNames)}`;
  }

  override relationConstraintName(
    table: string | Table,
    columnNames: string[],
  ): string {
    return `RELATION_${transformTableColumns(table, columnNames)}`;
  }

  override uniqueConstraintName(
    table: Table | string,
    columnNames: string[],
  ): string {
    return `UNIQUE_${transformTableColumns(table, columnNames)}`;
  }

  override joinColumnName(
    relationName: string,
    referencedColumnName: string,
  ): string {
    return snakeCase(`${relationName}_${referencedColumnName}`);
  }

  override joinTableName(
    firstTableName: string,
    secondTableName: string,
    firstPropertyName: string,
  ): string {
    return snakeCase(
      `${firstTableName}_${firstPropertyName.replace(/\./giu, '_')}_${
        secondTableName
      }`,
    );
  }

  override joinTableColumnName(
    tableName: string,
    propertyName: string,
    columnName?: string,
  ): string {
    return snakeCase(`${tableName}_${columnName ?? propertyName}`);
  }
}
