import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { User } from '@api/models/Users/User';
import { Staff } from '@api/models/Users/Staff';
import { Company } from '@api/models/Company/Company';
import { Role, RoleType } from '@api/models/Security/Role';

export default class CreateStaff implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository = connection.getRepository(User);
    const staffRepository = connection.getRepository(Staff);
    const companyRepository = connection.getRepository(Company);
    const roleRepository = connection.getRepository(Role);

    // Get Staff role
    const staffRole = await roleRepository.findOne({ where: { type: RoleType.STAFF } });
    if (!staffRole) {
      console.log('Staff role not found. Please run CreateRoles seed first.');
      return;
    }

    // Get companies
    const companies = await companyRepository.find({ relations: ['retailer', 'retailer.user'] });
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies seed first.');
      return;
    }

    // Create staff for each company
    for (const company of companies) {
      const retailerUser = company.retailer?.user;
      if (!retailerUser) continue;

      const staffMembers = [
        {
          user: {
            first_name: 'Sarah',
            last_name: 'Employee',
            email: `staff1@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            password: 'Pass313',
            role_id: staffRole.id,
            company_id: company.id,
            parent_user_id: retailerUser.id,
            isActive: true,
          },
          staff: {
            employeeId: `EMP-${company.id}-001`,
            department: 'Sales',
            position: 'Sales Associate',
            hireDate: new Date('2023-01-15'),
            isActive: true,
          },
        },
        {
          user: {
            first_name: 'Mike',
            last_name: 'Worker',
            email: `staff2@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            password: 'Pass313',
            role_id: staffRole.id,
            company_id: company.id,
            parent_user_id: retailerUser.id,
            isActive: true,
          },
          staff: {
            employeeId: `EMP-${company.id}-002`,
            department: 'Operations',
            position: 'Operations Manager',
            hireDate: new Date('2022-06-01'),
            isActive: true,
          },
        },
      ]; 

      for (const staffData of staffMembers) {
        let user = await userRepository.findOne({ where: { email: staffData.user.email } });

        if (!user) {
          user = userRepository.create(staffData.user);
          user = await userRepository.save(user);

          // Create staff record
          const existingStaff = await staffRepository.findOne({ where: { user_id: user.id } });
          if (!existingStaff) {
            const staff = staffRepository.create({
              user_id: user.id,
              company_id: company.id,
              ...staffData.staff,
            });
            await staffRepository.save(staff);
          }
        }
      }
    }
  }
}

