import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersTable1768152568510 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "account_id" uuid NOT NULL UNIQUE,
                "email" VARCHAR(255) NOT NULL UNIQUE,
                "nickname" VARCHAR(255) NOT NULL UNIQUE,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
            );
        `);
    await queryRunner.query(`
            CREATE INDEX "IDX_users_account_id" ON "users" ("account_id")
        `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_users_account_id"`);
    await queryRunner.query(`
            DROP TABLE "users";
        `);
  }
}
