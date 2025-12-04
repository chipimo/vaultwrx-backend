import 'reflect-metadata';
import { fixModuleAlias } from './src/utils/fix-module-alias';
fixModuleAlias(__dirname);

// Import the config
import { dbConfig } from './src/config/db';

// Force SSL for remote hosts - TypeORM CLI might not be reading the config properly
if (dbConfig.host && dbConfig.host !== 'localhost' && dbConfig.host !== '127.0.0.1') {
  console.log('TypeORM CLI - Force enabling SSL for remote host:', dbConfig.host);
  if (!dbConfig.extra) {
    dbConfig.extra = {};
  }
  dbConfig.extra.ssl = {
    rejectUnauthorized: false,
  };
}

// Log the config to verify SSL is set
console.log('TypeORM CLI - Final config:', JSON.stringify({
  host: dbConfig.host,
  database: dbConfig.database,
  hasExtra: !!dbConfig.extra,
  ssl: dbConfig.extra?.ssl,
}, null, 2));

// Export for TypeORM CLI
export = dbConfig;
