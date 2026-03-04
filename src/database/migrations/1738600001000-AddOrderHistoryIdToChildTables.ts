import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 2a: Add order_history_id (uuid, nullable, FK → order_history.id) to:
 * order_items, deceased, photos, order_extra_charges, order_contacts, comments.
 * Keep existing order_id (FK → orders).
 * Migration 2b: CHECK constraint on each: exactly one of order_id or order_history_id is NOT NULL.
 */
export class AddOrderHistoryIdToChildTables1738600001000 implements MigrationInterface {
  name = 'AddOrderHistoryIdToChildTables1738600001000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'order_items',
      'deceased',
      'photos',
      'order_extra_charges',
      'order_contacts',
      'comments',
    ];

    for (const table of tables) {
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "order_id" DROP NOT NULL`
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD COLUMN "order_history_id" uuid`
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "FK_${table}_order_history" FOREIGN KEY ("order_history_id") REFERENCES "order_history"("id") ON DELETE CASCADE ON UPDATE NO ACTION`
      );
      await queryRunner.query(
        `ALTER TABLE "${table}" ADD CONSTRAINT "CK_${table}_order_xor_history" CHECK (
          (order_id IS NOT NULL AND order_history_id IS NULL) OR
          (order_id IS NULL AND order_history_id IS NOT NULL)
        )`
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const tables = [
      'order_items',
      'deceased',
      'photos',
      'order_extra_charges',
      'order_contacts',
      'comments',
    ];

    for (const table of tables) {
      await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT "CK_${table}_order_xor_history"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP CONSTRAINT "FK_${table}_order_history"`);
      await queryRunner.query(`ALTER TABLE "${table}" DROP COLUMN "order_history_id"`);
      await queryRunner.query(
        `ALTER TABLE "${table}" ALTER COLUMN "order_id" SET NOT NULL`
      );
    }
  }
}
