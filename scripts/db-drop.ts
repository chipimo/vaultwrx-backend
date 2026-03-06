// Load module alias first
require('../fix-module-alias');

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { dbConfig } from '@base/config/db';

async function dropSchema() {
  try {
    console.log('Connecting with config:', {
      host: dbConfig.host,
      database: dbConfig.database,
      hasExtra: !!dbConfig.extra,
      ssl: dbConfig.extra?.ssl,
    });

    const connection = await createConnection(dbConfig);
    console.log('Connected successfully!');
    
    await connection.dropDatabase();
    console.log('Database schema dropped successfully!');
    
    await connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

dropSchema();

