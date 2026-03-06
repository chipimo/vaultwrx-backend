import 'reflect-metadata';
import * as path from 'path';
import { fixModuleAlias } from '../src/utils/fix-module-alias';
fixModuleAlias(path.join(__dirname, '..', 'src'));

import { createConnection } from 'typeorm';
import { dbConfig } from '@base/config/db';

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...');
    
    const tempConfig = { ...dbConfig, synchronize: false };
    const tempConnection = await createConnection(tempConfig);
    
    try {
      await tempConnection.query(`
        CREATE OR REPLACE FUNCTION uuid_generate_v4()
        RETURNS uuid AS $$
        BEGIN
          RETURN gen_random_uuid();
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('✅ UUID function configured');
    } catch (funcError: any) {
      console.warn('⚠️ Could not create UUID function:', funcError?.message);
    }
    
    // Fix data that would block sync: remove rows with NULL required columns, or set to default
    const deleteCleanups: Array<{ table: string; where: string; label: string }> = [
      { table: 'funeral_directors', where: 'user_id IS NULL', label: 'user_id' },
      { table: 'locations', where: 'retailer_id IS NULL', label: 'retailer_id' }
    ];
    for (const { table, where, label } of deleteCleanups) {
      try {
        const sql = `DELETE FROM "${table}" WHERE ${where}`;
        const result = await tempConnection.query(sql);
        const rowCount = (result as any)?.rowCount ?? (result as any)?.[1] ?? 0;
        if (rowCount > 0) {
          console.log(`✅ Removed ${rowCount} ${table} row(s) with NULL ${label}`);
        }
      } catch (err: any) {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`⚠️ Cleanup ${table} (${label}):`, err?.message ?? err);
        }
      }
    }

    // Set NULL prices to 0 in order_extra_charges (keep rows)
    try {
      // Resolve actual table/column names (DB may use different casing or naming)
      const tableResult = await tempConnection.query(
        `SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%order_extra%' LIMIT 1`
      );
      const tableRow = (tableResult as any)?.rows?.[0] ?? (tableResult as any)?.[0];
      const tableName = String(tableRow?.table_name ?? 'order_extra_charges').replace(/"/g, '');
      const colResult = await tempConnection.query(
        `SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = '${tableName.replace(/'/g, "''")}' AND (column_name = 'price' OR column_name LIKE '%price%') LIMIT 1`
      );
      const colRow = (colResult as any)?.rows?.[0] ?? (colResult as any)?.[0];
      const priceCol = String(colRow?.column_name ?? 'price').replace(/"/g, '');
      const updateResult = await tempConnection.query(
        `UPDATE "${tableName}" SET "${priceCol}" = 0 WHERE "${priceCol}" IS NULL`
      );
      const updateCount = (updateResult as any)?.rowCount ?? (updateResult as any)?.[1] ?? 0;
      if (updateCount > 0) {
        console.log(`✅ Set ${priceCol} = 0 for ${updateCount} order_extra_charges row(s)`);
      }
      const checkResult = await tempConnection.query(
        `SELECT COUNT(*)::int AS cnt FROM "${tableName}" WHERE "${priceCol}" IS NULL`
      );
      const raw = (checkResult as any)?.rows?.[0] ?? (checkResult as any)?.[0];
      const nullCount = raw?.cnt != null ? Number(raw.cnt) : (Array.isArray(raw) ? Number(raw[0]) : null);
      if (nullCount != null && nullCount > 0 && process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️ Still ${nullCount} order_extra_charges row(s) with NULL ${priceCol} after UPDATE`);
      }
    } catch (err: any) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`⚠️ order_extra_charges price fix:`, err?.message ?? err);
      }
    }

    await tempConnection.close();
    
    const syncConfig = { ...dbConfig, synchronize: true };
    const connection = await createConnection(syncConfig);
    
    console.log('✅ Database synchronized successfully');
    console.log('📋 Tables have been created/updated based on your entities');
    
    await connection.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Database synchronization failed:', error instanceof Error ? error.message : error);
    process.exit(1);
  }
}

syncDatabase();

