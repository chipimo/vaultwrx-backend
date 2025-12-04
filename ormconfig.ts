import 'reflect-metadata';
import { fixModuleAlias } from './src/utils/fix-module-alias';
fixModuleAlias(__dirname);

import { env } from '@base/utils/env';
import { toBool } from '@base/utils/to-bool';

const getSslConfig = () => {
  const sslEnabled = env('TYPEORM_SSL');
  const dbHost = env('TYPEORM_HOST');
  
  // If SSL is explicitly disabled, return false
  if (sslEnabled === 'false') {
    return false;
  }

  // If SSL is explicitly enabled, configure it
  if (sslEnabled === 'true') {
    const rejectUnauthorized = env('TYPEORM_SSL_REJECT_UNAUTHORIZED');
    
    // For cloud databases, always use rejectUnauthorized: false unless explicitly set to true
    // This is required for Azure PostgreSQL and most cloud databases
    if (rejectUnauthorized !== 'true') {
      return {
        rejectUnauthorized: false,
      };
    }
    
    return true;
  }

  // If SSL is not explicitly set, enable it for remote hosts (common for cloud PostgreSQL)
  // Localhost connections typically don't need SSL
  if (dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1') {
    // For remote/cloud databases, always enable SSL with rejectUnauthorized: false
    // This allows self-signed certificates which are common in cloud environments
    return {
      rejectUnauthorized: false,
    };
  }

  return false;
};

const connectionType = (env('TYPEORM_CONNECTION') || 'postgres') as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'better-sqlite3' | 'cockroachdb' | 'mongodb';

const sslConfig = getSslConfig();
const entitiesPath = env('TYPEORM_ENTITIES');

// Force console output - TypeORM CLI might suppress it
process.stdout.write('🔧 ORMConfig.ts - File loaded!\n');
process.stdout.write(`🔧 ORMConfig - SSL Config: ${JSON.stringify(sslConfig)}\n`);
process.stdout.write(`🔧 ORMConfig - Host: ${env('TYPEORM_HOST')}\n`);
console.log('ORMConfig - SSL Config:', sslConfig);
console.log('ORMConfig - Host:', env('TYPEORM_HOST'));

// Build base config
// Build base config - SSL will be added after host detection
const dbConfig: any = {
  type: connectionType,
  host: env('TYPEORM_HOST'),
  port: parseInt(env('TYPEORM_PORT') || '5432', 10),
  database: env('TYPEORM_DATABASE'),
  username: env('TYPEORM_USERNAME'),
  password: env('TYPEORM_PASSWORD'),
  entities: entitiesPath ? entitiesPath.split(',') : [],
  logging: toBool(env('TYPEORM_LOGGING')),
};

// CRITICAL: Detect Azure/remote BEFORE setting SSL
// We need to know if SSL is required before building the config
const dbHost = dbConfig.host || '';
const isAzurePostgresEarly = dbHost.includes('.postgres.database.azure.com') || 
                              dbHost.includes('.database.azure.com') || 
                              dbHost.includes('azure.com');
const isRemoteHostEarly = dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1' && !dbHost.includes('localhost');

// Use the early detection we did above
const isAzurePostgres = isAzurePostgresEarly;
const isRemoteHost = isRemoteHostEarly;

// ALWAYS force SSL for Azure PostgreSQL or any remote host
// CRITICAL: TypeORM CLI MUST have SSL - set it BEFORE any connection attempt
// For TypeORM 0.2.x, we need to ensure SSL is set in a way that survives object cloning
if (isAzurePostgres || isRemoteHost) {
  // Force SSL configuration - Azure PostgreSQL REQUIRES SSL
  // Use the format that pg driver expects
  const sslValue = { rejectUnauthorized: false };
  
  // CRITICAL: For TypeORM 0.2.x CLI, we MUST set extra.ssl
  // The pg driver in TypeORM 0.2.x reads from extra.ssl
  // Create a NEW extra object to ensure it's not lost during cloning
  const extraWithSsl = {
    ssl: sslValue,
  };
  
  // Merge with any existing extra properties
  if (dbConfig.extra) {
    Object.assign(extraWithSsl, dbConfig.extra, { ssl: sslValue });
  }
  
  dbConfig.extra = extraWithSsl;
  
  // Also set at root level (some TypeORM/CLI versions check this)
  dbConfig.ssl = sslValue;
  
  // TypeORM CLI might also need it in the connection options
  const optionsWithSsl = {
    ssl: sslValue,
  };
  if (dbConfig.options) {
    Object.assign(optionsWithSsl, dbConfig.options, { ssl: sslValue });
  }
  dbConfig.options = optionsWithSsl;
  
  // Force write to stdout to ensure it's seen
  process.stdout.write(`✅ ORMConfig - SSL FORCED for remote/Azure host: ${dbConfig.host}\n`);
  process.stdout.write(`✅ ORMConfig - extra.ssl: ${JSON.stringify(dbConfig.extra.ssl)}\n`);
  process.stdout.write(`✅ ORMConfig - root ssl: ${JSON.stringify(dbConfig.ssl)}\n`);
  console.log('✅ ORMConfig - SSL FORCED for remote/Azure host:', dbConfig.host);
  console.log('ORMConfig - extra.ssl:', JSON.stringify(dbConfig.extra.ssl, null, 2));
  console.log('ORMConfig - root ssl:', JSON.stringify(dbConfig.ssl, null, 2));
  console.log('ORMConfig - options.ssl:', JSON.stringify(dbConfig.options?.ssl, null, 2));
} else if (sslConfig) {
  // For localhost, use the configured SSL if set
  dbConfig.extra = {
    ssl: sslConfig === true ? true : sslConfig,
  };
  if (typeof sslConfig === 'object') {
    dbConfig.ssl = sslConfig;
  }
  console.log('ORMConfig - SSL enabled');
} else {
  // Even for localhost, if SSL is explicitly requested, enable it
  if (env('TYPEORM_SSL') === 'true') {
    dbConfig.extra = {
      ssl: { rejectUnauthorized: false },
    };
    dbConfig.ssl = { rejectUnauthorized: false };
    console.log('ORMConfig - SSL enabled via TYPEORM_SSL=true');
  }
}

// FINAL SAFETY CHECK: Ensure SSL is definitely set before export
// This is a last resort to catch any edge cases
if ((isAzurePostgres || isRemoteHost) && !dbConfig.extra?.ssl) {
  process.stderr.write('⚠️ WARNING: SSL not properly set in ormconfig.ts! Forcing SSL...\n');
  console.error('⚠️ WARNING: SSL not properly set in ormconfig.ts! Forcing SSL...');
  dbConfig.extra = Object.assign({}, dbConfig.extra || {}, {
    ssl: { rejectUnauthorized: false },
  });
  dbConfig.ssl = { rejectUnauthorized: false };
  if (!dbConfig.options) dbConfig.options = {};
  dbConfig.options.ssl = { rejectUnauthorized: false };
}

// Verify SSL is set before export - CRITICAL CHECK
if ((isAzurePostgres || isRemoteHost)) {
  if (!dbConfig.extra?.ssl) {
    const error = 'CRITICAL: SSL not set for Azure PostgreSQL in ormconfig.ts!';
    process.stderr.write(`❌ ${error}\n`);
    throw new Error(error);
  }
  process.stdout.write('✅ ORMConfig - SSL verified before export\n');
  console.log('✅ ORMConfig - SSL verified before export');
  
  // Final debug output
  process.stdout.write(`✅ Final SSL check - extra.ssl: ${JSON.stringify(dbConfig.extra.ssl)}\n`);
  process.stdout.write(`✅ Final SSL check - root ssl: ${JSON.stringify(dbConfig.ssl)}\n`);
}

// Export the config for TypeORM CLI
export = dbConfig;

