import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1700000000000 implements MigrationInterface {
  name = 'InitialSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create Users Table
    await queryRunner.query(`
      CREATE TABLE "users" (
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

    // Create Player Profiles Table
    await queryRunner.query(`
      CREATE TABLE "player_profiles" (
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

    // Create Matches Table
    await queryRunner.query(`
      CREATE TABLE "matches" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "room_id" varchar(64) NOT NULL,
        "server_node_id" varchar(64) NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'IN_PROGRESS',
        "started_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "ended_at" TIMESTAMP WITH TIME ZONE,
        "winner_team_id" integer,
        "total_players" integer NOT NULL,
        CONSTRAINT "PK_matches_id" PRIMARY KEY ("id")
      );
    `);

    // Create Match Participants Table
    await queryRunner.query(`
      CREATE TABLE "match_participants" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "match_id" uuid NOT NULL,
        "player_id" uuid NOT NULL,
        "kills" integer NOT NULL DEFAULT 0,
        "deaths" integer NOT NULL DEFAULT 0,
        "score" integer NOT NULL DEFAULT 0,
        "rank_position" integer,
        "disconnected_at" TIMESTAMP WITH TIME ZONE,
        CONSTRAINT "PK_match_participants_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_match_participants_match" FOREIGN KEY ("match_id") REFERENCES "matches"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_match_participants_user" FOREIGN KEY ("player_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    // Create Server Metrics Telemetry History Table
    await queryRunner.query(`
      CREATE TABLE "server_metrics_history" (
        "id" BIGSERIAL NOT NULL,
        "timestamp" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "server_pod_id" varchar(100) NOT NULL,
        "active_players" integer NOT NULL,
        "active_rooms" integer NOT NULL,
        "cpu_usage_pct" numeric(5,2) NOT NULL,
        "memory_usage_mb" numeric(10,2) NOT NULL,
        "network_rx_kbps" numeric(10,2) NOT NULL,
        "network_tx_kbps" numeric(10,2) NOT NULL,
        "average_latency_ms" numeric(6,2) NOT NULL,
        "dropped_packets" integer NOT NULL DEFAULT 0,
        CONSTRAINT "PK_server_metrics_history_id" PRIMARY KEY ("id")
      );
    `);

    // Create Performance Indexes
    await queryRunner.query(`CREATE INDEX "IDX_player_profiles_elo" ON "player_profiles" ("elo_rating");`);
    await queryRunner.query(`CREATE INDEX "IDX_player_profiles_score" ON "player_profiles" ("total_score");`);
    await queryRunner.query(`CREATE INDEX "IDX_server_metrics_timestamp" ON "server_metrics_history" ("timestamp");`);
    await queryRunner.query(`CREATE INDEX "IDX_server_metrics_pod" ON "server_metrics_history" ("server_pod_id");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "server_metrics_history";`);
    await queryRunner.query(`DROP TABLE "match_participants";`);
    await queryRunner.query(`DROP TABLE "matches";`);
    await queryRunner.query(`DROP TABLE "player_profiles";`);
    await queryRunner.query(`DROP TABLE "users";`);
  }
}
