#!/usr/bin/env ts-node

import { DataSource } from 'typeorm';
import { SeedRunner } from './SeedRunner';
import { config } from 'dotenv';

// Load environment variables
config();

// Database configuration
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'vaultwrx',
  entities: [
    'src/api/models/**/*.ts'
  ],
  synchronize: false, // Don't auto-sync in production
  logging: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error']
});

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || 'all';

  console.log(`🌱 Running seeds with command: ${command}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
  console.log('Database:', process.env.DB_NAME || 'vaultwrx');
  console.log('=====================================');

  const seedRunner = new SeedRunner(dataSource);

  try {
    switch (command) {
      case 'all':
        await seedRunner.runAllSeeds();
        break;
      case 'users':
        await seedRunner.runUserSeeds();
        break;
      default:
        console.log('❌ Unknown command. Available commands:');
        console.log('  all    - Run all seeds');
        console.log('  users  - Run user system seeds only');
        process.exit(1);
    }
  } catch (error) {
    console.error('💥 Seeding failed:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, shutting down gracefully...');
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  if (dataSource.isInitialized) {
    await dataSource.destroy();
  }
  process.exit(0);
});

// Run the main function
main().catch((error) => {
  console.error('💥 Unhandled error:', error);
  process.exit(1);
});
