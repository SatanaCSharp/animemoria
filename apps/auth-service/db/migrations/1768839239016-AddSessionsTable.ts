import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSessionsTable1768839239016 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TYPE "app_type_enum" AS ENUM ('admin', 'web')
        `);

    await queryRunner.query(`
            CREATE TABLE "sessions" (
                "id" uuid NOT NULL UNIQUE DEFAULT uuid_generate_v4(),
                "account_id" uuid NOT NULL,
                "refresh_token_hash" VARCHAR DEFAULT NULL ,
                "app_type" "app_type_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                CONSTRAINT "PK_session_id" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_sessions_account_id" ON "sessions" ("account_id")
        `);

    await queryRunner.query(`
            ALTER TABLE "sessions" 
            ADD CONSTRAINT "FK_sessions_accounts" 
            FOREIGN KEY ("account_id") 
            REFERENCES "accounts"("id") 
            ON DELETE CASCADE
        `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "sessions" DROP CONSTRAINT "FK_sessions_accounts"`,
    );
    await queryRunner.query(`DROP INDEX "IDX_sessions_account_id"`);
    await queryRunner.query(`DROP TABLE "sessions"`);
    await queryRunner.query(`DROP TYPE "app_type_enum"`);
  }
}
