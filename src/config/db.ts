import { env } from '@base/utils/env';
import { toBool } from '@base/utils/to-bool';
import { entities } from './entities';

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

const connectionType = (env('TYPEORM_CONNECTION') || 'postgres') as 'postgres' | 'mysql' | 'mariadb' | 'sqlite' | 'better-sqlite3' | 'cockroachdb' | 'mongodb';

const sslConfig = getSslConfig();
const defaultEntities = entities;

const dbPassword = env('TYPEORM_PASSWORD');
const dbPasswordString = dbPassword ? String(dbPassword) : '';

if (!dbPasswordString) {
  console.warn('WARNING: TYPEORM_PASSWORD is not set! Database connection will fail.');
}

const finalEntities = defaultEntities.filter(
  (entity) => typeof entity === 'function' && entity.prototype && entity.prototype.constructor
);

export const dbConfig: any = {
  type: connectionType,
  host: env('TYPEORM_HOST'),
  port: parseInt(env('TYPEORM_PORT') || '5432', 10),
  database: env('TYPEORM_DATABASE'),
  username: env('TYPEORM_USERNAME'),
  password: dbPasswordString, // Explicitly convert to string
  entities: finalEntities,
  logging: toBool(env('TYPEORM_LOGGING')),
  synchronize: toBool(env('TYPEORM_SYNCHRONIZE')),
};

const isAzurePostgres = dbConfig.host && (
  dbConfig.host.includes('.postgres.database.azure.com') ||
  dbConfig.host.includes('.database.azure.com') ||
  dbConfig.host.includes('azure.com')
);
const isRemoteHost = dbConfig.host && dbConfig.host !== 'localhost' && dbConfig.host !== '127.0.0.1' && !dbConfig.host.includes('localhost');

if (isAzurePostgres || isRemoteHost) {
  const sslValue = { rejectUnauthorized: false };
  dbConfig.extra = {
    ...(dbConfig.extra || {}),
    ssl: sslValue,
  };
  dbConfig.ssl = sslValue;
} else if (sslConfig) {
  dbConfig.extra = {
    ...(dbConfig.extra || {}),
    ssl: sslConfig === true ? true : sslConfig,
  };
  if (typeof sslConfig === 'object') {
    dbConfig.ssl = sslConfig;
  }
}

// On Netlify (serverless), use a shorter connection timeout so we fail fast
// and don't hold the function for 15+ seconds. Also ensure DB firewall
// allows connections from the internet (e.g. 0.0.0.0/0 or your provider's guidance).
if (process.env.NETLIFY === 'true') {
  dbConfig.extra = { ...(dbConfig.extra || {}), connectionTimeoutMillis: 10000 };
}

