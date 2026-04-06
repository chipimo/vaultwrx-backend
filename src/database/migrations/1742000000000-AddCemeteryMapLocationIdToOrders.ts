import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCemeteryMapLocationIdToOrders1742000000000 implements MigrationInterface {
  name = 'AddCemeteryMapLocationIdToOrders1742000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD COLUMN "cemetery_map_location_id" uuid
        `);

    await queryRunner.query(`
            ALTER TABLE "orders"
            ADD CONSTRAINT "FK_orders_cemetery_map_location"
            FOREIGN KEY ("cemetery_map_location_id") REFERENCES "map_locations"("id")
            ON DELETE SET NULL ON UPDATE NO ACTION
        `);

    await queryRunner.query(`
            CREATE INDEX "IDX_orders_cemetery_map_location_id" ON "orders" ("cemetery_map_location_id")
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_orders_cemetery_map_location_id"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_orders_cemetery_map_location"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "cemetery_map_location_id"`);
  }
}
