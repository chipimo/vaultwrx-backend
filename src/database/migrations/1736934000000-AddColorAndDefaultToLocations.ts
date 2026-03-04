import { MigrationInterface, QueryRunner } from "typeorm";

export class AddColorAndDefaultToLocations1736934000000 implements MigrationInterface {
    name = 'AddColorAndDefaultToLocations1736934000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" ADD "color" character varying`);
        await queryRunner.query(`ALTER TABLE "locations" ADD "is_default" boolean DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "is_default"`);
        await queryRunner.query(`ALTER TABLE "locations" DROP COLUMN "color"`);
    }
}
