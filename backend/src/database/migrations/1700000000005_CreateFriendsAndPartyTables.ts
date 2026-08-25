import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateFriendsAndPartyTables1700000000005 implements MigrationInterface {
  name = 'CreateFriendsAndPartyTables1700000000005';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "friendships" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "requester_id" uuid NOT NULL,
        "addressee_id" uuid NOT NULL,
        "status" varchar(20) NOT NULL DEFAULT 'PENDING',
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_friendships_requester_addressee" UNIQUE ("requester_id", "addressee_id"),
        CONSTRAINT "PK_friendships_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_friendships_requester" FOREIGN KEY ("requester_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_friendships_addressee" FOREIGN KEY ("addressee_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "parties" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "leader_id" uuid NOT NULL,
        "max_members" integer NOT NULL DEFAULT 4,
        "is_in_queue" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_parties_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_parties_leader" FOREIGN KEY ("leader_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "party_members" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "party_id" uuid NOT NULL,
        "user_id" uuid NOT NULL,
        "is_ready" boolean NOT NULL DEFAULT false,
        "joined_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_party_members_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_party_members_party" FOREIGN KEY ("party_id") REFERENCES "parties"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_party_members_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "party_members";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "parties";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "friendships";`);
  }
}
