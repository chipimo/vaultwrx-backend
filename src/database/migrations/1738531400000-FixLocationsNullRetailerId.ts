import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes locations rows with NULL retailer_id so that the retailer_id column
 * can satisfy NOT NULL when running db-sync or schema updates.
 */
export class FixLocationsNullRetailerId1738531400000 implements MigrationInterface {
  name = 'FixLocationsNullRetailerId1738531400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM locations WHERE retailer_id IS NULL`
    );
  }

  public async down(): Promise<void> {
    // No way to restore deleted rows
  }
}
