import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMapLocationsTable1741564800000 implements MigrationInterface {
    name = 'CreateMapLocationsTable1741564800000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`
            CREATE TABLE "map_locations" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "company_id" uuid NOT NULL,
                "retailer_id" uuid NOT NULL,
                "name" character varying NOT NULL,
                "address" text,
                "city" character varying,
                "state" character varying,
                "zip_code" character varying,
                "phone" character varying,
                "email" character varying,
                "description" text,
                "latitude" decimal(10,7) NOT NULL,
                "longitude" decimal(10,7) NOT NULL,
                "place_id" character varying,
                "formatted_address" text,
                "is_active" boolean NOT NULL DEFAULT true,
                "color" character varying,
                "is_default" boolean NOT NULL DEFAULT false,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_map_locations" PRIMARY KEY ("id")
            )
        `);

        await queryRunner.query(`
            ALTER TABLE "map_locations"
            ADD CONSTRAINT "FK_map_locations_company"
            FOREIGN KEY ("company_id") REFERENCES "companies"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            ALTER TABLE "map_locations"
            ADD CONSTRAINT "FK_map_locations_retailer"
            FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id")
            ON DELETE CASCADE ON UPDATE NO ACTION
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_map_locations_company_id" ON "map_locations" ("company_id")
        `);

        await queryRunner.query(`
            CREATE INDEX "IDX_map_locations_lat_lng" ON "map_locations" ("latitude", "longitude")
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "IDX_map_locations_lat_lng"`);
        await queryRunner.query(`DROP INDEX "IDX_map_locations_company_id"`);
        await queryRunner.query(`ALTER TABLE "map_locations" DROP CONSTRAINT "FK_map_locations_retailer"`);
        await queryRunner.query(`ALTER TABLE "map_locations" DROP CONSTRAINT "FK_map_locations_company"`);
        await queryRunner.query(`DROP TABLE "map_locations"`);
    }
}
