import {MigrationInterface, QueryRunner} from "typeorm";

export class AddLogoToCompanies1736956800000 implements MigrationInterface {
    name = 'AddLogoToCompanies1736956800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" ADD "logo" character varying`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "companies" DROP COLUMN "logo"`);
    }
}
