import { Connection, createConnection } from 'typeorm';
import { UserSeeds } from './UserSeeds';

export class SeedRunner {
  private connection: Connection | null = null;

  constructor(private connectionOptions?: any) {}

  public async runAllSeeds(): Promise<void> {
    console.log('🚀 Starting database seeding process...');
    console.log('=====================================');

    try {
      // Initialize database connection
      this.connection = await createConnection(this.connectionOptions);
      console.log('✅ Database connection initialized');

      // Run user system seeds
      const userSeeds = new UserSeeds(this.connection);
      await userSeeds.seed();

      console.log('=====================================');
      console.log('🎉 All seeds completed successfully!');
      console.log('=====================================');

    } catch (error) {
      console.error('❌ Error during seeding process:', error);
      throw error;
    } finally {
      // Close database connection
      if (this.connection && this.connection.isConnected) {
        await this.connection.close();
        console.log('🔌 Database connection closed');
      }
    }
  }

  public async runUserSeeds(): Promise<void> {
    console.log('🚀 Starting user system seeding...');
    
    try {
      this.connection = await createConnection(this.connectionOptions);

      const userSeeds = new UserSeeds(this.connection);
      await userSeeds.seed();

      console.log('✅ User system seeding completed!');
    } catch (error) {
      console.error('❌ Error during user seeding:', error);
      throw error;
    } finally {
      if (this.connection && this.connection.isConnected) {
        await this.connection.close();
      }
    }
  }
}
