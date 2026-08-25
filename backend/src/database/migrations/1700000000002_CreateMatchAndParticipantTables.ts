import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateMatchAndParticipantTables1700000000002 implements MigrationInterface {
  name = 'CreateMatchAndParticipantTables1700000000002';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "matches" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "room_id" varchar(64) NOT NULL,
        "server_pod_id" varchar(100) NOT NULL,
        "region" varchar(20) NOT NULL DEFAULT 'US-EAST',
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "ended_at" TIMESTAMP WITH TIME ZONE,
        "duration_seconds" integer NOT NULL DEFAULT 0,
        "winner_user_id" uuid,
        CONSTRAINT "PK_matches_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_matches_winner_user" FOREIGN KEY ("winner_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "match_participants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "match_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "score" integer NOT NULL DEFAULT 0,
        "orbs_collected" integer NOT NULL DEFAULT 0,
        "elo_before" integer NOT NULL DEFAULT 1200,
        "elo_after" integer NOT NULL DEFAULT 1200,
        "elo_change" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_match_participants_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_match_participants_match" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_match_participants_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_matches_room_id" ON "matches" ("room_id");`);
    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_match_participants_match" ON "match_participants" ("match_id");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "match_participants";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "matches";`);
  }
}
