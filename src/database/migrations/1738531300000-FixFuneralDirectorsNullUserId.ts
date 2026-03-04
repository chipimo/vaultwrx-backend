import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Removes funeral_directors rows with NULL user_id so that the user_id column
 * can satisfy NOT NULL (e.g. when running db-sync or schema updates).
 */
export class FixFuneralDirectorsNullUserId1738531300000 implements MigrationInterface {
  name = 'FixFuneralDirectorsNullUserId1738531300000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DELETE FROM funeral_directors WHERE user_id IS NULL`
    );
  }

  public async down(): Promise<void> {
    // No way to restore deleted rows
  }
}
