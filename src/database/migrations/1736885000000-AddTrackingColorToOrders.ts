import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTrackingColorToOrders1736885000000 implements MigrationInterface {
    name = 'AddTrackingColorToOrders1736885000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" ADD "tracking_color" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "tracking_color"`);
    }
}
