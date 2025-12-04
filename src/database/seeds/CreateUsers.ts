import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { User } from '@api/models/Users/User';
import { Role, RoleType } from '@api/models/Security/Role';

export default class CreateUsers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const roleRepository = connection.getRepository(Role);
    
    // Get default role (Customer)
    const customerRole = await roleRepository.findOne({ where: { type: RoleType.CUSTOMER } });
    if (!customerRole) {
      console.log('Customer role not found. Please run CreateRoles seed first.');
      return;
    }

    // Create generic users with Customer role
    // Note: For specific user types (Admin, Retailer, Customer, Staff, FuneralDirector),
    // use their dedicated seed files instead
    const users = await factory(User)().map(async (user) => {
      user.role_id = customerRole.id;
      user.isActive = true;
      return user;
    }).createMany(5);
  }
}
