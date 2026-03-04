import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Sets order_extra_charges.price to 0 where it is NULL so the column
 * can satisfy NOT NULL when running db-sync or schema updates.
 */
export class FixOrderExtraChargesNullPrice1738531500000 implements MigrationInterface {
  name = 'FixOrderExtraChargesNullPrice1738531500000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `UPDATE order_extra_charges SET price = 0 WHERE price IS NULL`
    );
  }

  public async down(): Promise<void> {
    // No way to revert the update
  }
}
