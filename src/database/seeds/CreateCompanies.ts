import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { Company } from '@api/models/Company/Company';

export default class CreateCompanies implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const companyRepository = connection.getRepository(Company);

    // Create sample companies (without retailers - retailers are created separately)
    const companies = [
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

    for (const companyData of companies) {
      // Check if company already exists
      let company = await companyRepository.findOne({ where: { name: companyData.name } });
      
      if (!company) {
        company = companyRepository.create(companyData);
        company = await companyRepository.save(company);
        console.log(`✅ Created company: ${company.name}`);
      }
    }
  }
}

