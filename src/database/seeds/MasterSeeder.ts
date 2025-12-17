import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import CreateRoles from './CreateRoles';
import CreateCompanies from './CreateCompanies';
import CreateRetailers from './CreateRetailers';
import CreateAdmins from './CreateAdmins';
import CreateCustomers from './CreateCustomers';
import CreateStaff from './CreateStaff';
import CreateFuneralDirectors from './CreateFuneralDirectors';
import CreateUsers from './CreateUsers';
import CreateColors from './CreateColors';
import CreateEmblems from './CreateEmblems';
import CreateCategories from './CreateCategories';
import CreateProducts from './CreateProducts';
import CreateOrders from './CreateOrders';

export default class MasterSeeder implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    console.log('🌱 Starting database seeding...\n');

    // 1. Create Roles and Permissions (must be first)
    console.log('📋 Creating roles and permissions...');
    const createRoles = new CreateRoles();
    await createRoles.run(factory, connection);
    console.log('✅ Roles and permissions created\n');

    // 2. Create Admins
    console.log('👤 Creating admins...');
    const createAdmins = new CreateAdmins();
    await createAdmins.run(factory, connection);
    console.log('✅ Admins created\n');

    // 3. Create Companies
    console.log('🏢 Creating companies...');
    const createCompanies = new CreateCompanies();
    await createCompanies.run(factory, connection);
    console.log('✅ Companies created\n');

    // 4. Create Retailers (linked to companies)
    console.log('🏪 Creating retailers...');
    const createRetailers = new CreateRetailers();
    await createRetailers.run(factory, connection);
    console.log('✅ Retailers created\n');

    // 5. Create Customers
    console.log('🛒 Creating customers...');
    const createCustomers = new CreateCustomers();
    await createCustomers.run(factory, connection);
    console.log('✅ Customers created\n');

    // 6. Create Staff
    console.log('👔 Creating staff...');
    const createStaff = new CreateStaff();
    await createStaff.run(factory, connection);
    console.log('✅ Staff created\n');

    // 7. Create Funeral Directors
    console.log('⚱️ Creating funeral directors...');
    const createFuneralDirectors = new CreateFuneralDirectors();
    await createFuneralDirectors.run(factory, connection);
    console.log('✅ Funeral directors created\n');

    // 8. Create generic users (optional)
    console.log('👥 Creating generic users...');
    const createUsers = new CreateUsers();
    await createUsers.run(factory, connection);
    console.log('✅ Generic users created\n');

    // 9. Create Colors
    console.log('🎨 Creating colors...');
    const createColors = new CreateColors();
    await createColors.run(factory, connection);
    console.log('✅ Colors created\n');

    // 10. Create Emblems
    console.log('🏷️ Creating emblems...');
    const createEmblems = new CreateEmblems();
    await createEmblems.run(factory, connection);
    console.log('✅ Emblems created\n');

    // 11. Create Categories
    console.log('📂 Creating categories...');
    const createCategories = new CreateCategories();
    await createCategories.run(factory, connection);
    console.log('✅ Categories created\n');

    // 12. Create Products
    console.log('📦 Creating products...');
    const createProducts = new CreateProducts();
    await createProducts.run(factory, connection);
    console.log('✅ Products created\n');

    // 13. Create Orders (includes locations and service extras)
    console.log('🛒 Creating orders...');
    const createOrders = new CreateOrders();
    await createOrders.run(factory, connection);
    console.log('✅ Orders created\n');

    console.log('🎉 Database seeding completed successfully!');
  }
}

