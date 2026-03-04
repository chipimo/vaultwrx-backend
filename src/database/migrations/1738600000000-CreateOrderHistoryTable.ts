import { MigrationInterface, QueryRunner } from 'typeorm';

/**
 * Migration 1a: Create order_history with all columns from orders (match Order entity 1:1),
 * plus archived_at (timestamptz), order_type (varchar). PK id (uuid). UNIQUE(id) for idempotency.
 * Migration 1b: Indexes on (company_id, date_of_service), (company_id, archived_at), (company_id, order_type, date_of_service).
 * Note: RANGE partitioning on date_of_service would require PK to include date_of_service in PostgreSQL,
 * which would require composite FKs from child tables. We use a single table for simpler FK to id.
 */
export class CreateOrderHistoryTable1738600000000 implements MigrationInterface {
  name = 'CreateOrderHistoryTable1738600000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "order_history" (
        "id" uuid NOT NULL,
        "company_id" uuid,
        "user_id" uuid,
        "retailer_id" uuid,
        "customer_id" uuid,
        "director_id" uuid,
        "staff_id" uuid,
        "status" character varying(50) NOT NULL DEFAULT 'draft',
        "total" numeric(10,2) NOT NULL DEFAULT '0',
        "subtotal" numeric(10,2) NOT NULL DEFAULT '0',
        "discount" numeric(10,2) NOT NULL DEFAULT '0',
        "salesTax" numeric(10,2) NOT NULL DEFAULT '0',
        "apply_platform_fee" boolean NOT NULL DEFAULT false,
        "service_type_name" character varying,
        "service_type_price" numeric(10,2) NOT NULL DEFAULT '0',
        "cemetery" character varying,
        "location_id" uuid,
        "date_of_service" date,
        "time_of_service" TIME,
        "arrival_time" TIME,
        "contact" character varying,
        "email" character varying,
        "cell_phone" character varying,
        "is_deleted" boolean NOT NULL DEFAULT false,
        "is_edited" boolean NOT NULL DEFAULT false,
        "is_parent" boolean NOT NULL DEFAULT false,
        "delivered" boolean NOT NULL DEFAULT false,
        "confirmed" boolean NOT NULL DEFAULT false,
        "new_order_notifications_sent" boolean NOT NULL DEFAULT false,
        "comments" text,
        "delivery_instructions" text,
        "order_d_status" character varying,
        "product_paint_color_options" character varying,
        "service_extras" text,
        "store_name" character varying,
        "store_address1" character varying,
        "store_address2" character varying,
        "store_city" character varying,
        "store_state" character varying,
        "store_zip" character varying,
        "tracking_color" character varying,
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        "archived_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "order_type" character varying,
        CONSTRAINT "PK_order_history_id" PRIMARY KEY ("id"),
        CONSTRAINT "UQ_order_history_id" UNIQUE ("id")
      )
    `);

    await queryRunner.query(
      `CREATE INDEX "IDX_order_history_company_date" ON "order_history" ("company_id", "date_of_service")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_history_company_archived" ON "order_history" ("company_id", "archived_at")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_order_history_company_type_date" ON "order_history" ("company_id", "order_type", "date_of_service")`
    );

    await queryRunner.query(
      `ALTER TABLE "order_history" ADD CONSTRAINT "FK_order_history_company" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
    await queryRunner.query(
      `ALTER TABLE "order_history" ADD CONSTRAINT "FK_order_history_location" FOREIGN KEY ("location_id") REFERENCES "locations"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "order_history" DROP CONSTRAINT "FK_order_history_location"`);
    await queryRunner.query(`ALTER TABLE "order_history" DROP CONSTRAINT "FK_order_history_company"`);
    await queryRunner.query(`DROP INDEX "IDX_order_history_company_type_date"`);
    await queryRunner.query(`DROP INDEX "IDX_order_history_company_archived"`);
    await queryRunner.query(`DROP INDEX "IDX_order_history_company_date"`);
    await queryRunner.query(`DROP TABLE "order_history"`);
  }
}
