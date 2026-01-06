import { env } from '../utils/env';
import { fixModuleAlias } from '../utils/fix-module-alias';

// Fix module alias for TypeORM CLI
fixModuleAlias(__dirname);

// Import all entities
import * as entities from './entities';

// TypeORM v0.2.x configuration
export default {
  type: 'postgres',
  host: env('TYPEORM_HOST'),
  port: parseInt(env('TYPEORM_PORT')),
  username: env('TYPEORM_USERNAME'),
  password: env('TYPEORM_PASSWORD'),
  database: env('TYPEORM_DATABASE'),
  synchronize: false,
  logging: false, // Disabled to reduce console noise
  entities: Object.values(entities),
  migrations: ['src/database/migrations/*.ts'],
  subscribers: ['src/database/subscribers/*.ts'],
  cli: {
    migrationsDir: 'src/database/migrations',
    entitiesDir: 'src/api/models',
  },
}; 
