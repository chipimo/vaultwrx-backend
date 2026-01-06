// Script to generate ormconfig.json with SSL properly configured
// TypeORM CLI might read JSON files more reliably than TypeScript

import * as fs from 'fs';
import * as path from 'path';
import { env } from '@base/utils/env';

const host = env('TYPEORM_HOST') || '';
const isAzurePostgres = host.includes('.postgres.database.azure.com') || 
                        host.includes('.database.azure.com') || 
                        host.includes('azure.com');
const isRemoteHost = host && host !== 'localhost' && host !== '127.0.0.1' && !host.includes('localhost');
const needsSsl = isAzurePostgres || isRemoteHost;

// Build config object
const ormconfigJson: any = {
  type: env('TYPEORM_CONNECTION') || 'postgres',
  host: host,
  port: parseInt(env('TYPEORM_PORT') || '5432', 10),
  database: env('TYPEORM_DATABASE'),
  username: env('TYPEORM_USERNAME'),
  password: env('TYPEORM_PASSWORD'),
  entities: env('TYPEORM_ENTITIES') ? env('TYPEORM_ENTITIES').split(',') : [],
  logging: env('TYPEORM_LOGGING') === 'true',
};

// CRITICAL: Set SSL for Azure PostgreSQL
// TypeORM 0.2.37 PostgresDriver sets ssl: credentials.ssl first, then spreads options.extra
// So we MUST set ssl at root level AND in extra.ssl
if (needsSsl) {
  const sslValue = {
    rejectUnauthorized: false
  };
  
  // CRITICAL: Set at root level first (this is what credentials.ssl will be)
  // PostgresDriver line 1082: ssl: credentials.ssl
  ormconfigJson.ssl = sslValue;
  
  // CRITICAL: Also set in extra.ssl (this gets spread after, so it should work)
  // PostgresDriver line 1085: ...options.extra
  ormconfigJson.extra = {
    ssl: sslValue
  };
  
  // Also set in options for completeness
  ormconfigJson.options = {
    ssl: sslValue
  };
  
  console.log('⚠️ SSL is REQUIRED for Azure PostgreSQL');
  console.log('⚠️ Set SSL at root level AND in extra.ssl');
}

const configPath = path.join(__dirname, '../ormconfig.json');
fs.writeFileSync(configPath, JSON.stringify(ormconfigJson, null, 2));

// CRITICAL: Also create a CommonJS module that exports the config
// TypeORM CLI loads JS files via require(), so this should work
const jsConfigPath = path.join(__dirname, '../ormconfig.js');
const sslValue = { rejectUnauthorized: false };

// Build the JS config with SSL properly set
// PostgresDriver.js line 1082: ssl: credentials.ssl (from root config.ssl)
// PostgresDriver.js line 1085: ...options.extra (spreads extra.ssl)
const jsConfigContent = `// Auto-generated config with SSL for Azure PostgreSQL
// PostgresDriver creates connectionOptions with:
//   ssl: credentials.ssl (line 1082)
//   ...options.extra (line 1085) - this should override if set
const sslConfig = ${JSON.stringify(sslValue)};

const config = ${JSON.stringify(ormconfigJson, null, 2)};

// CRITICAL: Ensure SSL is set in both places
if (config.host && (config.host.includes('azure.com') || config.host.includes('.database.azure.com'))) {
  // Set at root level (for credentials.ssl)
  config.ssl = config.ssl || sslConfig;
  // Set in extra (for ...options.extra spread)
  config.extra = config.extra || {};
  config.extra.ssl = config.extra.ssl || sslConfig;
}

// Final verification - throw error if SSL is missing
if (config.host && config.host.includes('azure.com') && !config.extra?.ssl) {
  throw new Error('CRITICAL: SSL not set in ormconfig.js for Azure PostgreSQL!');
}

module.exports = config;
`;
fs.writeFileSync(jsConfigPath, jsConfigContent);

console.log('✅ Generated ormconfig.json with SSL:', needsSsl);
console.log('✅ Generated ormconfig.js with SSL:', needsSsl);
console.log('Config extra.ssl:', JSON.stringify(ormconfigJson.extra?.ssl));

