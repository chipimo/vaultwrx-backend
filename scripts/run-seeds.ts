// Load module alias first
require('../fix-module-alias');

import 'reflect-metadata';
import { createConnection, Connection } from 'typeorm';
import { dbConfig } from '@base/config/db';
import { factory, Factory, useSeeding } from 'typeorm-seeding';
import MasterSeeder from '../src/database/seeds/MasterSeeder';

async function runSeeds() {
  try {
    const config = {
      ...dbConfig,
    };

    console.log('Connecting with config:', {
      host: config.host,
      database: config.database,
      hasExtra: !!config.extra,
      ssl: config.extra?.ssl,
    });

    const connection = await createConnection(config);
    
    console.log('Connected successfully!');
    
    // Initialize seeding - this sets up the factory with the connection
    // The connection is automatically detected from TypeORM
    await useSeeding();
    
    console.log('Running seeds...\n');
    
    // Run the master seeder
    const masterSeeder = new MasterSeeder();
    await masterSeeder.run(factory, connection);
    
    console.log('\n✅ Seeding completed successfully!');
    
    await connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runSeeds();

