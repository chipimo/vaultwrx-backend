/**
 * One-off script to run the OrderHistoryArchiveCronJob (clone past orders to order_history).
 * Usage: npm run archive-orders
 */

// Load env and module alias first (before any imports that use process.env)
require('dotenv').config();
require('../fix-module-alias');

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { dbConfig } from '@base/config/db';
import { OrderHistoryArchiveCronJob } from '../src/api/cron-jobs/OrderHistoryArchiveCronJob';

async function runArchive() {
  try {
    const config = { ...dbConfig };

    console.log('Connecting to database...', {
      host: config.host,
      database: config.database,
    });

    const connection = await createConnection(config);
    console.log('Connected. Running OrderHistoryArchiveCronJob...\n');

    const job = new OrderHistoryArchiveCronJob();
    await job.handle();

    console.log('\nDone.');
    await connection.close();
    console.log('Connection closed.');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

runArchive();
