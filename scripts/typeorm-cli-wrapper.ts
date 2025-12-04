// CRITICAL: TypeORM CLI MUST have SSL for Azure PostgreSQL
// This file is loaded by TypeORM CLI via -f flag
// We MUST ensure SSL is set in the exported config object

import 'reflect-metadata';
import { fixModuleAlias } from '../src/utils/fix-module-alias';
fixModuleAlias(__dirname);

// Import the config that works for the server
import { dbConfig } from '../src/config/db';

// Detect Azure PostgreSQL - be very aggressive
const host = dbConfig.host || '';
const isAzurePostgres = host.includes('.postgres.database.azure.com') || 
                        host.includes('.database.azure.com') || 
                        host.includes('azure.com');
const isRemoteHost = host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('localhost');

// CRITICAL: Azure PostgreSQL REQUIRES SSL
// Force SSL unconditionally for remote/Azure hosts
const sslConfig = { rejectUnauthorized: false };
const mustUseSsl = isAzurePostgres || isRemoteHost;

// Create a completely new config object to ensure SSL is definitely included
// Don't rely on spreading - build it explicitly
const typeormCliConfig: any = {
  type: dbConfig.type,
  host: dbConfig.host,
  port: dbConfig.port,
  database: dbConfig.database,
  username: dbConfig.username,
  password: dbConfig.password,
  entities: dbConfig.entities,
  logging: dbConfig.logging,
  // CRITICAL: extra.ssl is what pg driver uses
  extra: {
    ssl: mustUseSsl ? sslConfig : (dbConfig.extra?.ssl || false),
  },
  // Also set at root level
  ssl: mustUseSsl ? sslConfig : (dbConfig.ssl || false),
  // And in options
  options: {
    ssl: mustUseSsl ? sslConfig : (dbConfig.options?.ssl || false),
  },
};

// Final verification - throw error if SSL is missing for Azure
if (mustUseSsl && !typeormCliConfig.extra.ssl) {
  throw new Error('CRITICAL: SSL not set for Azure PostgreSQL in typeorm-cli-wrapper.ts!');
}

// Export using CommonJS format (TypeORM CLI uses require())
export = typeormCliConfig;

