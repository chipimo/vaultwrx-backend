// Load module alias first
require('../fix-module-alias');

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { dbConfig } from '@base/config/db';

async function syncDatabase() {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Create connection with synchronize enabled
    const syncConfig = { ...dbConfig, synchronize: true };
    const connection = await createConnection(syncConfig);
    
    // Try to create UUID function if it doesn't exist
    try {
      await connection.query(`
        CREATE OR REPLACE FUNCTION uuid_generate_v4()
        RETURNS uuid AS $$
        BEGIN
          RETURN gen_random_uuid();
        END;
        $$ LANGUAGE plpgsql;
      `);
      console.log('✅ UUID function configured');
    } catch (funcError: any) {
      // Ignore errors - function might already exist or user might not have permissions
      console.warn('⚠️ Could not create UUID function:', funcError?.message);
    }
    
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

