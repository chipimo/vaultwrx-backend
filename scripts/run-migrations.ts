// Load module alias first
require('../fix-module-alias');

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { dbConfig } from '@base/config/db';
import * as path from 'path';
import { env } from '@base/utils/env';

async function runMigrations() {
  try {
    // Get migrations path from env or use default
    const migrationsPath = env('TYPEORM_MIGRATIONS');
    const migrations = migrationsPath 
      ? migrationsPath.split(',').map(p => p.trim())
      : ['src/database/migrations/*.ts'];
    
    const config = {
      ...dbConfig,
      migrations,
      migrationsRun: false,
    };

    console.log('Connecting with config:', {
      host: config.host,
      database: config.database,
      hasExtra: !!config.extra,
      ssl: config.extra?.ssl,
      migrations: config.migrations,
    });

    const connection = await createConnection(config);
    
    console.log('Connected successfully!');
    
    // Azure PostgreSQL uses gen_random_uuid() instead of uuid_generate_v4()
    // Try to enable pgcrypto extension (usually available in Azure)
    console.log('Ensuring UUID support...');
    try {
      await connection.query('CREATE EXTENSION IF NOT EXISTS "pgcrypto"');
      console.log('pgcrypto extension enabled/verified.');
    } catch (error: any) {
      // If extension can't be created, we'll need to update migrations to use gen_random_uuid()
      if (error.message.includes('not allow-listed') || error.message.includes('permission denied')) {
        console.warn('Warning: Cannot enable extensions. Migrations may need to use gen_random_uuid() instead of uuid_generate_v4().');
      } else if (!error.message.includes('already exists')) {
        console.warn('Warning: Could not enable pgcrypto extension:', error.message);
      } else {
        console.log('pgcrypto extension already exists.');
      }
    }
    
    console.log('Running migrations...');
    
    await connection.runMigrations();
    console.log('Migrations completed successfully!');
    
    await connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runMigrations();

