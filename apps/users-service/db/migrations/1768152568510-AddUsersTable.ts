import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddUsersTable1768152568510 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
         CREATE TYPE "users_status_enum" AS ENUM ('active', 'blocked');
    `);

    await queryRunner.query(`
            CREATE TABLE "users" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "email" VARCHAR(255) NOT NULL UNIQUE,
                "nickname" VARCHAR(255) NOT NULL UNIQUE,
                "password" VARCHAR(255) NOT NULL,
                "status" "users_status_enum" NOT NULL,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_user_id" PRIMARY KEY ("id")
            );
        `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            DROP TABLE "users";
        `);

    await queryRunner.query(`
            DROP TYPE IF EXISTS "users_status_enum";
        `);
  }
}
