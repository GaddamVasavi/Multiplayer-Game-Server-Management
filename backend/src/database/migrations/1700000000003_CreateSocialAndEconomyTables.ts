import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateSocialAndEconomyTables1700000000003 implements MigrationInterface {
  name = 'CreateSocialAndEconomyTables1700000000003';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "chat_messages" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sender_id" uuid NOT NULL,
        "channel" varchar(20) NOT NULL DEFAULT 'GLOBAL',
        "target_room_id" varchar(64),
        "content" text NOT NULL,
        "is_flagged" boolean NOT NULL DEFAULT false,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_chat_messages_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_chat_messages_sender" FOREIGN KEY ("sender_id") REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "shop_items" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "sku" varchar(64) NOT NULL,
        "name" varchar(100) NOT NULL,
        "description" text NOT NULL,
        "category" varchar(20) NOT NULL DEFAULT 'SKIN',
        "price_coins" integer NOT NULL DEFAULT 500,
        "rarity" varchar(20) NOT NULL DEFAULT 'RARE',
        "hex_color" varchar(10) NOT NULL DEFAULT '#06b6d4',
        CONSTRAINT "UQ_shop_items_sku" UNIQUE ("sku"),
        CONSTRAINT "PK_shop_items_id" PRIMARY KEY ("id")
      );
    `);

    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "user_inventory" (
        "id" uuid NOT NULL DEFAULT gen_random_uuid(),
        "user_id" uuid NOT NULL,
        "item_id" uuid NOT NULL,
        "is_equipped" boolean NOT NULL DEFAULT false,
        "purchased_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_inventory_user_item" UNIQUE ("user_id", "item_id"),
        CONSTRAINT "PK_user_inventory_id" PRIMARY KEY ("id"),
        CONSTRAINT "FK_user_inventory_user" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
        CONSTRAINT "FK_user_inventory_item" FOREIGN KEY ("item_id") REFERENCES "shop_items"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`CREATE INDEX IF NOT EXISTS "IDX_chat_messages_channel" ON "chat_messages" ("channel");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "user_inventory";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "shop_items";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "chat_messages";`);
  }
}
