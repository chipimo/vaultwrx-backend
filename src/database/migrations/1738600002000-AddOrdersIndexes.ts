import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 3: Add indexes on orders: (company_id, date_of_service) and date_of_service if not present.
 */
export class AddOrdersIndexes1738600002000 implements MigrationInterface {
  name = 'AddOrdersIndexes1738600002000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_company_date_of_service" ON "orders" ("company_id", "date_of_service")`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "IDX_orders_date_of_service" ON "orders" ("date_of_service")`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_date_of_service"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_orders_company_date_of_service"`);
  }
}
