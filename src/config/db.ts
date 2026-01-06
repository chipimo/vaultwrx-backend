import { env } from '@base/utils/env';
import { toBool } from '@base/utils/to-bool';
import { entities } from './entities';

/**
 * Parse a database URL into connection components
 * Format: postgres://username:password@host:port/database?sslmode=require
 */
const parseDatabaseUrl = (url: string) => {
  try {
    const parsed = new URL(url);
    return {
      host: parsed.hostname,
      port: parseInt(parsed.port || '5432', 10),
      database: parsed.pathname.slice(1), // Remove leading '/'
      username: parsed.username,
      password: decodeURIComponent(parsed.password),
      ssl: parsed.searchParams.get('sslmode') === 'require' || 
           parsed.searchParams.get('ssl') === 'true' ||
           parsed.hostname.includes('neon.tech') ||
           parsed.hostname.includes('supabase') ||
           !parsed.hostname.includes('localhost'),
    };
  } catch (error) {
    console.error('Failed to parse database URL:', error);
    return null;
  }
};

const getSslConfig = () => {
  const sslEnabled = env('TYPEORM_SSL');
  const dbHost = env('TYPEORM_HOST');
  
  if (sslEnabled === 'false') {
    return false;
  }

  if (sslEnabled === 'true') {
    const rejectUnauthorized = env('TYPEORM_SSL_REJECT_UNAUTHORIZED');
    
    if (rejectUnauthorized === 'false' || (dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1')) {
      return {
        rejectUnauthorized: false,
      };
    }
    
    if (rejectUnauthorized === 'true') {
      return true;
    }
    
    return {
      rejectUnauthorized: false,
    };
  }

  if (dbHost && dbHost !== 'localhost' && dbHost !== '127.0.0.1' && !dbHost.includes('localhost')) {
    return {
      rejectUnauthorized: false,
    };
  }

  return false;
};

// Check for Netlify database URL first (for serverless environments)
const netlifyDbUrl = env('NETLIFY_DATABASE_URL') || env('DATABASE_URL');
const parsedUrl = netlifyDbUrl ? parseDatabaseUrl(netlifyDbUrl) : null;

const connectionType = (env('TYPEORM_CONNECTION') || 'postgres') as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'better-sqlite3' | 'cockroachdb' | 'mongodb';

const sslConfig = getSslConfig();
const defaultEntities = entities;

// Use parsed URL if available, otherwise fall back to individual env vars
const dbHost = parsedUrl?.host || env('TYPEORM_HOST');
const dbPort = parsedUrl?.port || parseInt(env('TYPEORM_PORT') || '5432', 10);
const dbDatabase = parsedUrl?.database || env('TYPEORM_DATABASE');
const dbUsername = parsedUrl?.username || env('TYPEORM_USERNAME');
const dbPassword = parsedUrl?.password || env('TYPEORM_PASSWORD');
const dbPasswordString = dbPassword ? String(dbPassword) : '';

if (!dbPasswordString && !parsedUrl) {
  console.warn('WARNING: Database password is not set! Database connection will fail.');
}

if (parsedUrl) {
  console.log('📦 Using database URL configuration');
  console.log('🔗 Database host:', dbHost);
} else {
  console.log('📦 Using individual database environment variables');
}

const finalEntities = defaultEntities.filter(
  (entity) => typeof entity === 'function' && entity.prototype && entity.prototype.constructor
);

export const dbConfig: any = {
  type: connectionType,
  host: dbHost,
  port: dbPort,
  database: dbDatabase,
  username: dbUsername,
  password: dbPasswordString,
  entities: finalEntities,
  logging: toBool(env('TYPEORM_LOGGING')),
  synchronize: toBool(env('TYPEORM_SYNCHRONIZE')),
};

// Determine if SSL is needed
const isNeonDb = dbConfig.host && dbConfig.host.includes('neon.tech');
const isSupabaseDb = dbConfig.host && dbConfig.host.includes('supabase');
const isAzurePostgres = dbConfig.host && (
  dbConfig.host.includes('.postgres.database.azure.com') ||
  dbConfig.host.includes('.database.azure.com') ||
  dbConfig.host.includes('azure.com')
);
const isRemoteHost = dbConfig.host && 
  dbConfig.host !== 'localhost' && 
  dbConfig.host !== '127.0.0.1' && 
  !dbConfig.host.includes('localhost');

// Configure SSL for serverless-friendly databases
if (isNeonDb || isSupabaseDb) {
  // Neon and Supabase require SSL with specific settings
  dbConfig.ssl = {
    rejectUnauthorized: false,
  };
  dbConfig.extra = {
    ssl: {
      rejectUnauthorized: false,
    },
  };
  console.log('🔒 SSL enabled for serverless database');
} else if (isAzurePostgres || isRemoteHost) {
  const sslValue = { rejectUnauthorized: false };
  dbConfig.extra = {
    ssl: sslValue,
  };
  dbConfig.ssl = sslValue;
} else if (sslConfig) {
  dbConfig.extra = {
    ssl: sslConfig === true ? true : sslConfig,
  };
  if (typeof sslConfig === 'object') {
    dbConfig.ssl = sslConfig;
  }
}

// Add connection pooling settings for serverless
if (process.env.NETLIFY === 'true') {
  dbConfig.extra = {
    ...dbConfig.extra,
    // Reduce pool size for serverless
    max: 3,
    // Connection timeout
    connectionTimeoutMillis: 10000,
    // Idle timeout
    idleTimeoutMillis: 30000,
  };
  console.log('⚡ Applied serverless connection pool settings');
}
