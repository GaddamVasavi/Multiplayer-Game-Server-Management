import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSeasonPassAndQuestsTables1700000000004 implements MigrationInterface {
  name = 'CreateSeasonPassAndQuestsTables1700000000004';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "season_definitions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "season_number" integer NOT NULL,
        "title" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "start_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "end_date" TIMESTAMP WITH TIME ZONE NOT NULL,
        "max_tier" integer NOT NULL DEFAULT 50,
        CONSTRAINT "UQ_season_number" UNIQUE ("season_number"),
        CONSTRAINT "PK_season_definitions" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "season_tiers" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "season_id" uuid NOT NULL,
        "tier_number" integer NOT NULL,
        "required_xp" integer NOT NULL DEFAULT 1000,
        "reward_title" varchar(100) NOT NULL,
        "reward_type" varchar(50) NOT NULL DEFAULT 'COINS',
        "reward_value" integer NOT NULL DEFAULT 500,
        "is_premium" boolean NOT NULL DEFAULT false,
        CONSTRAINT "PK_season_tiers" PRIMARY KEY ("id"),
        CONSTRAINT "FK_season_tiers_season" FOREIGN KEY ("season_id") REFERENCES "season_definitions"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "quest_definitions" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "code" varchar(64) NOT NULL,
        "title" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "type" varchar(20) NOT NULL DEFAULT 'DAILY',
        "target_value" integer NOT NULL DEFAULT 5,
        "reward_coins" integer NOT NULL DEFAULT 250,
        "reward_xp" integer NOT NULL DEFAULT 500,
        CONSTRAINT "UQ_quest_code" UNIQUE ("code"),
        CONSTRAINT "PK_quest_definitions" PRIMARY KEY ("id")
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "quest_definitions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "season_tiers";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "season_definitions";`);
  }
}
