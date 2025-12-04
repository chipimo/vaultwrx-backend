import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { Company } from '@api/models/Company/Company';
import { Role, RoleType } from '@api/models/Security/Role';
import { User } from '@api/models/Users/User';
import { Retailer } from '@api/models/Users/Retailer';

export default class CreateRetailers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const companyRepository = connection.getRepository(Company);
    const userRepository = connection.getRepository(User);
    const retailerRepository = connection.getRepository(Retailer);
    const roleRepository = connection.getRepository(Role);

    // Get Retailer role
    const retailerRole = await roleRepository.findOne({ where: { type: RoleType.RETAILER } });
    if (!retailerRole) {
      console.log('Retailer role not found. Please run CreateRoles seed first.');
      return;
    }

    // Get existing companies without retailers, or create new ones
    let companies = await companyRepository.find({ where: { retailer_id: null } });
    
    // If no companies exist, create some
    if (companies.length === 0) {
      const newCompanies = [
        {
          name: 'ABC Funeral Services',
          description: 'Premier funeral service provider',
          address: '123 Main Street',
          phone: '555-0101',
          email: 'info@abcfuneral.com',
        },
        {
          name: 'XYZ Memorial Services',
          description: 'Family-owned funeral home since 1950',
          address: '456 Oak Avenue',
          phone: '555-0202',
          email: 'contact@xyzmemorial.com',
        },
        {
          name: 'Sunset Funeral Home',
          description: 'Compassionate care for your loved ones',
          address: '789 Sunset Boulevard',
          phone: '555-0303',
          email: 'info@sunsetfuneral.com',
        },
      ];

      for (const companyData of newCompanies) {
        const existingCompany = await companyRepository.findOne({ where: { name: companyData.name } });
        if (!existingCompany) {
          const company = companyRepository.create(companyData);
          await companyRepository.save(company);
          companies.push(company);
        }
      }
    }

    // Create retailers for companies that don't have one
    const retailers = [
      {
        user: {
          first_name: 'John',
          last_name: 'Retailer',
          email: 'retailer1@example.com',
          password: 'Pass313',
          role_id: retailerRole.id,
          isActive: true,
        },
        retailer: {
          businessLicense: 'BL-2024-001',
          taxId: 'TAX-001',
          isVerified: true,
        },
      },
      {
        user: {
          first_name: 'Jane',
          last_name: 'Smith',
          email: 'retailer2@example.com',
          password: 'Pass313',
          role_id: retailerRole.id,
          isActive: true,
        },
        retailer: {
          businessLicense: 'BL-2024-002',
          taxId: 'TAX-002',
          isVerified: true,
        },
      },
      {
        user: {
          first_name: 'Robert',
          last_name: 'Johnson',
          email: 'retailer3@example.com',
          password: 'Pass313',
          role_id: retailerRole.id,
          isActive: true,
        },
        retailer: {
          businessLicense: 'BL-2024-003',
          taxId: 'TAX-003',
          isVerified: false,
        },
      },
    ];

    for (let i = 0; i < companies.length && i < retailers.length; i++) {
      const company = companies[i];
      const retailerData = retailers[i];

      // Check if company already has a retailer
      if (company.retailer_id) {
        console.log(`Company ${company.name} already has a retailer. Skipping...`);
        continue;
      }

      // Check if user already exists
      let user = await userRepository.findOne({ where: { email: retailerData.user.email } });

      if (!user) {
        user = userRepository.create(retailerData.user);
        user = await userRepository.save(user);
      }

      // Check if retailer already exists for this user
      let retailer = await retailerRepository.findOne({ where: { user_id: user.id } });

      if (!retailer) {
        retailer = retailerRepository.create({
          user_id: user.id,
          businessLicense: retailerData.retailer.businessLicense,
          taxId: retailerData.retailer.taxId,
          isVerified: retailerData.retailer.isVerified,
        });
        retailer = await retailerRepository.save(retailer);
      }

      // Link company to retailer
      if (!company.retailer_id) {
        company.retailer_id = retailer.id;
        await companyRepository.save(company);
        console.log(`✅ Created retailer for company: ${company.name}`);
      }
    }
  }
}

