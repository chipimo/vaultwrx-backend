-- Run against Postgres when not using TypeORM synchronize.
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_name VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS business_email VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS fax VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS country VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS sales_representative VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS billing_option VARCHAR(64);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS tags TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS special_order_instructions TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS pricelist_selections JSONB;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS allow_customer_see_prices BOOLEAN NOT NULL DEFAULT false;
