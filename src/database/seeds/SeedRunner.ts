import { DataSource } from 'typeorm';
import { UserSeeds } from './UserSeeds';

export class SeedRunner {
  constructor(private dataSource: DataSource) {}

  public async runAllSeeds(): Promise<void> {
    console.log('🚀 Starting database seeding process...');
    console.log('=====================================');

    try {
      // Initialize database connection
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
        console.log('✅ Database connection initialized');
      }

      // Run user system seeds
      const userSeeds = new UserSeeds(this.dataSource);
      await userSeeds.seed();

      console.log('=====================================');
      console.log('🎉 All seeds completed successfully!');
      console.log('=====================================');

    } catch (error) {
      console.error('❌ Error during seeding process:', error);
      throw error;
    } finally {
      // Close database connection
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
        console.log('🔌 Database connection closed');
      }
    }
  }

  public async runUserSeeds(): Promise<void> {
    console.log('🚀 Starting user system seeding...');
    
    try {
      if (!this.dataSource.isInitialized) {
        await this.dataSource.initialize();
      }

      const userSeeds = new UserSeeds(this.dataSource);
      await userSeeds.seed();

      console.log('✅ User system seeding completed!');
    } catch (error) {
      console.error('❌ Error during user seeding:', error);
      throw error;
    } finally {
      if (this.dataSource.isInitialized) {
        await this.dataSource.destroy();
      }
    }
  }
}
