import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserAndProfileTables1700000000001 implements MigrationInterface {
  name = 'CreateUserAndProfileTables1700000000001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "username" varchar(50) NOT NULL,
        "email" varchar(255) NOT NULL,
        "password_hash" varchar(255) NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_username" UNIQUE ("username"),
        CONSTRAINT "UQ_users_email" UNIQUE ("email"),
        CONSTRAINT "PK_users_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "player_profiles" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "display_name" varchar(50) NOT NULL,
        "elo_rating" integer NOT NULL DEFAULT 1200,
        "matches_played" integer NOT NULL DEFAULT 0,
        "wins" integer NOT NULL DEFAULT 0,
        "losses" integer NOT NULL DEFAULT 0,
        "total_score" bigint NOT NULL DEFAULT 0,
        "avatar_url" varchar(255),
        "is_online" boolean NOT NULL DEFAULT false,
        "last_seen" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "UQ_player_profiles_user_id" UNIQUE ("user_id"),
        CONSTRAINT "PK_player_profiles_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_player_profiles_users" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_player_profiles_elo" ON "player_profiles" ("elo_rating");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_player_profiles_score" ON "player_profiles" ("total_score");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "player_profiles";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
  }
}
