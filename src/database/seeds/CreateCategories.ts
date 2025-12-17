import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { Category } from '@api/models/Products/Category';
import { Retailer } from '@api/models/Users/Retailer';
import { Company } from '@api/models/Company/Company';

export default class CreateCategories implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const categoryRepository = connection.getRepository(Category);
    const companyRepository = connection.getRepository(Company);
    const retailerRepository = connection.getRepository(Retailer);

    // Get companies with retailers
    const companies = await companyRepository.find({ relations: ['retailer'] });
    
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies and CreateRetailers seeds first.');
      return;
    }

    const categories = [
      // Product categories
      { name: 'Premium', code: 'PREM', description: 'Premium quality products and services', sortOrder: 1 },
      { name: 'Standard', code: 'STD', description: 'Standard quality products and services', sortOrder: 2 },
      { name: 'Budget', code: 'BUD', description: 'Budget-friendly options', sortOrder: 3 },
      { name: 'Custom', code: 'CUST', description: 'Custom and personalized products', sortOrder: 4 },
      { name: 'Service', code: 'SVC', description: 'Service-based offerings', sortOrder: 5 },
      { name: 'Bulk', code: 'BULK', description: 'Bulk and wholesale items', sortOrder: 6 },
      // Additional categories
      { name: 'Traditional', code: 'TRAD', description: 'Traditional style products', sortOrder: 7 },
      { name: 'Modern', code: 'MOD', description: 'Modern and contemporary designs', sortOrder: 8 },
      { name: 'Religious', code: 'REL', description: 'Religious and spiritual products', sortOrder: 9 },
      { name: 'Military', code: 'MIL', description: 'Military and veteran products', sortOrder: 10 },
      { name: 'Eco-Friendly', code: 'ECO', description: 'Environmentally friendly options', sortOrder: 11 },
      { name: 'Rental', code: 'RENT', description: 'Rental products and services', sortOrder: 12 },
    ];

    for (const company of companies) {
      if (!company.retailer_id) {
        console.log(`Company ${company.name} has no retailer. Skipping categories...`);
        continue;
      }

      const retailer = await retailerRepository.findOne({ where: { id: company.retailer_id } });
      if (!retailer) continue;

      for (const categoryData of categories) {
        const existingCategory = await categoryRepository.findOne({
          where: { name: categoryData.name, companyId: company.id },
        });

        if (!existingCategory) {
          const category = categoryRepository.create({
            ...categoryData,
            companyId: company.id,
            retailerId: retailer.id,
            isActive: true,
          });
          await categoryRepository.save(category);
          console.log(`  ✅ Created category: ${categoryData.name} for ${company.name}`);
        }
      }
    }
  }
}

