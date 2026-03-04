import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddCalendarChargesToRetailers1738531200000 implements MigrationInterface {
  name = 'AddCalendarChargesToRetailers1738531200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "retailers" ADD "saturday_charge" numeric(10,2) DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "retailers" ADD "sunday_charge" numeric(10,2) DEFAULT 0`
    );
    await queryRunner.query(
      `ALTER TABLE "retailers" ADD "holiday_charge" numeric(10,2) DEFAULT 0`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "retailers" DROP COLUMN "holiday_charge"`);
    await queryRunner.query(`ALTER TABLE "retailers" DROP COLUMN "sunday_charge"`);
    await queryRunner.query(`ALTER TABLE "retailers" DROP COLUMN "saturday_charge"`);
  }
}
