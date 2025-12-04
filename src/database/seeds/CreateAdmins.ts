import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { User } from '@api/models/Users/User';
import { Admin } from '@api/models/Users/Admin';
import { Role, RoleType } from '@api/models/Security/Role';

export default class CreateAdmins implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository = connection.getRepository(User);
    const adminRepository = connection.getRepository(Admin);
    const roleRepository = connection.getRepository(Role);

    // Get Admin role
    const adminRole = await roleRepository.findOne({ where: { type: RoleType.ADMIN } });
    if (!adminRole) {
      console.log('Admin role not found. Please run CreateRoles seed first.');
      return;
    }

    const admins = [
      {
        user: {
          first_name: 'Super',
          last_name: 'Admin',
          email: 'admin@example.com',
          password: 'Pass313',
          role_id: adminRole.id,
          isActive: true,
        },
        admin: {
          adminLevel: 'super',
          canManageCompanies: true,
          canManageAdmins: true,
        },
      },
      {
        user: {
          first_name: 'System',
          last_name: 'Administrator',
          email: 'system@example.com',
          password: 'Pass313',
          role_id: adminRole.id,
          isActive: true,
        },
        admin: {
          adminLevel: 'system',
          canManageCompanies: true,
          canManageAdmins: true,
        },
      },
    ];

    for (const adminData of admins) {
      let user = await userRepository.findOne({ where: { email: adminData.user.email } });

      if (!user) {
        user = userRepository.create(adminData.user);
        user = await userRepository.save(user);

        // Create admin record
        const existingAdmin = await adminRepository.findOne({ where: { user_id: user.id } });
        if (!existingAdmin) {
          const admin = adminRepository.create({
            user_id: user.id,
            ...adminData.admin,
          });
          await adminRepository.save(admin);
        }
      }
    }
  }
}

