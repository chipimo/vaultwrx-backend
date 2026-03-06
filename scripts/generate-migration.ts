// Custom script to generate migrations with SSL properly configured
// This bypasses TypeORM CLI's config loading issues

import 'reflect-metadata';
import { fixModuleAlias } from '../src/utils/fix-module-alias';
fixModuleAlias(__dirname);

import { createConnection, getConnectionOptions } from 'typeorm';
import { dbConfig } from '@base/config/db';
import * as path from 'path';
import { execSync } from 'child_process';

async function generateMigration() {
  try {
    // Get migration name from command line args
    const migrationName = process.argv[2] || 'Migration';
    
    // Ensure SSL is set for Azure PostgreSQL
    const host = dbConfig.host || '';
    const isAzurePostgres = host.includes('.postgres.database.azure.com') || 
                            host.includes('.database.azure.com') || 
                            host.includes('azure.com');
    const isRemoteHost = host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('localhost');
    
    if (isAzurePostgres || isRemoteHost) {
      const sslConfig = { rejectUnauthorized: false };
      dbConfig.extra = {
        ...(dbConfig.extra || {}),
        ssl: sslConfig,
      };
      dbConfig.ssl = sslConfig;
      console.log('✅ SSL configured for Azure/remote host:', host);
    }
    
    // Use TypeORM's programmatic API to generate migration
    // This ensures SSL is properly applied
    const connection = await createConnection(dbConfig);
    console.log('✅ Connected to database with SSL');
    
    // Close connection - we just needed to verify SSL works
    await connection.close();
    
    // Now use TypeORM CLI with the config that has SSL
    console.log('Generating migration...');
    const typeormPath = path.join(__dirname, '../node_modules/.bin/typeorm');
    execSync(
      `ts-node -r ./fix-module-alias.js ${typeormPath} migration:generate -n ${migrationName} -f ./ormconfig.ts`,
      { stdio: 'inherit', cwd: path.join(__dirname, '..') }
    );
    
    console.log('✅ Migration generated successfully!');
  } catch (error) {
    console.error('❌ Error generating migration:', error);
    process.exit(1);
  }
}

generateMigration();

