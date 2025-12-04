import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { User } from '@api/models/Users/User';
import { Customer } from '@api/models/Users/Customer';
import { Company } from '@api/models/Company/Company';
import { Role, RoleType } from '@api/models/Security/Role';

export default class CreateCustomers implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const userRepository = connection.getRepository(User);
    const customerRepository = connection.getRepository(Customer);
    const companyRepository = connection.getRepository(Company);
    const roleRepository = connection.getRepository(Role);

    // Get Customer role
    const customerRole = await roleRepository.findOne({ where: { type: RoleType.CUSTOMER } });
    if (!customerRole) {
      console.log('Customer role not found. Please run CreateRoles seed first.');
      return;
    }

    // Get companies
    const companies = await companyRepository.find();
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies seed first.');
      return;
    }

    // Create customers for each company
    for (const company of companies) {
      const customers = [
        {
          user: {
            first_name: 'Alice',
            last_name: 'Customer',
            email: `customer1@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            password: 'Pass313',
            role_id: customerRole.id,
            company_id: company.id,
            isActive: true,
          },
          customer: {
            phone: '555-1001',
            address: '789 Customer Street',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            dateOfBirth: new Date('1985-05-15'),
            preferredContactMethod: 'email',
            isActive: true,
          },
        },
        {
          user: {
            first_name: 'Bob',
            last_name: 'Client',
            email: `customer2@${company.name.toLowerCase().replace(/\s+/g, '')}.com`,
            password: 'Pass313',
            role_id: customerRole.id,
            company_id: company.id,
            isActive: true,
          },
          customer: {
            phone: '555-1002',
            address: '321 Client Avenue',
            city: 'Springfield',
            state: 'IL',
            zipCode: '62702',
            dateOfBirth: new Date('1990-08-20'),
            preferredContactMethod: 'phone',
            isActive: true,
          },
        },
      ];

      for (const customerData of customers) {
        let user = await userRepository.findOne({ where: { email: customerData.user.email } });

        if (!user) {
          user = userRepository.create(customerData.user);
          user = await userRepository.save(user);

          // Create customer record
          const existingCustomer = await customerRepository.findOne({ where: { user_id: user.id } });
          if (!existingCustomer) {
            const customer = customerRepository.create({
              user_id: user.id,
              company_id: company.id,
              ...customerData.customer,
            });
            await customerRepository.save(customer);
          }
        }
      }
    }
  }
}

