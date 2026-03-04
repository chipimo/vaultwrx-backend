import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Adds the "price" column to order_extra_charges if it does not exist.
 * Uses NOT NULL DEFAULT 0 so existing rows get 0 and the column satisfies the entity.
 * Run this when the table was created without "price" (e.g. by an older sync or different migration path).
 */
export class AddOrderExtraChargesPriceIfMissing1738531600000 implements MigrationInterface {
  name = 'AddOrderExtraChargesPriceIfMissing1738531600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "order_extra_charges"
      ADD COLUMN IF NOT EXISTS "price" numeric(10,2) NOT NULL DEFAULT 0
    `);
  }

  public async down(): Promise<void> {
    // Optional: DROP COLUMN IF EXISTS "price" - omit if you don't want to remove the column on rollback
  }
}
