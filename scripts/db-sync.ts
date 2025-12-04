import 'reflect-metadata';
import { fixModuleAlias } from '../src/utils/fix-module-alias';
fixModuleAlias(__dirname);

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

