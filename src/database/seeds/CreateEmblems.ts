import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { Emblem } from '@api/models/Products/Emblem';
import { Retailer } from '@api/models/Users/Retailer';
import { Company } from '@api/models/Company/Company';

export default class CreateEmblems implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const emblemRepository = connection.getRepository(Emblem);
    const companyRepository = connection.getRepository(Company);
    const retailerRepository = connection.getRepository(Retailer);

    // Get companies with retailers
    const companies = await companyRepository.find({ relations: ['retailer'] });
    
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies and CreateRetailers seeds first.');
      return;
    }

    const emblems: Array<{
      name: string;
      description: string;
      image: string | null;
      imageName: string | null;
    }> = [
      // Religious emblems
      { name: 'Cross', description: 'Traditional Christian cross emblem', image: null, imageName: null },
      { name: 'Crucifix', description: 'Catholic crucifix emblem', image: null, imageName: null },
      { name: 'Star of David', description: 'Jewish Star of David emblem', image: null, imageName: null },
      { name: 'Crescent Moon', description: 'Islamic crescent moon emblem', image: null, imageName: null },
      { name: 'Dove', description: 'Peace dove emblem', image: null, imageName: null },
      { name: 'Angel', description: 'Guardian angel emblem', image: null, imageName: null },
      { name: 'Praying Hands', description: 'Praying hands emblem', image: null, imageName: null },
      // Nature emblems
      { name: 'Rose', description: 'Single rose flower emblem', image: null, imageName: null },
      { name: 'Lily', description: 'Lily flower emblem', image: null, imageName: null },
      { name: 'Oak Tree', description: 'Oak tree emblem symbolizing strength', image: null, imageName: null },
      { name: 'Butterfly', description: 'Butterfly emblem symbolizing transformation', image: null, imageName: null },
      { name: 'Sunrise', description: 'Sunrise emblem symbolizing new beginnings', image: null, imageName: null },
      // Military emblems
      { name: 'American Flag', description: 'United States flag emblem', image: null, imageName: null },
      { name: 'Eagle', description: 'American eagle emblem', image: null, imageName: null },
      { name: 'Military Star', description: 'Military service star emblem', image: null, imageName: null },
      { name: 'Anchor', description: 'Navy anchor emblem', image: null, imageName: null },
      // Fraternal emblems
      { name: 'Masonic Square & Compass', description: 'Masonic emblem', image: null, imageName: null },
      { name: 'Knights of Columbus', description: 'Knights of Columbus emblem', image: null, imageName: null },
      { name: 'Elk', description: 'Elks Lodge emblem', image: null, imageName: null },
      // Other emblems
      { name: 'Heart', description: 'Heart emblem symbolizing love', image: null, imageName: null },
      { name: 'Infinity', description: 'Infinity symbol emblem', image: null, imageName: null },
      { name: 'Open Book', description: 'Open book emblem', image: null, imageName: null },
      { name: 'Musical Notes', description: 'Musical notes emblem', image: null, imageName: null },
      { name: 'No Emblem', description: 'No emblem - plain finish', image: null, imageName: null },
    ];

    for (const company of companies) {
      if (!company.retailer_id) {
        console.log(`Company ${company.name} has no retailer. Skipping emblems...`);
        continue;
      }

      const retailer = await retailerRepository.findOne({ where: { id: company.retailer_id } });
      if (!retailer) continue;

      for (const emblemData of emblems) {
        const existingEmblem = await emblemRepository.findOne({
          where: { name: emblemData.name, companyId: company.id },
        });

        if (!existingEmblem) {
          const emblem = emblemRepository.create({
            ...emblemData,
            companyId: company.id,
            retailerId: retailer.id,
            isActive: true,
          });
          await emblemRepository.save(emblem);
          console.log(`  ✅ Created emblem: ${emblemData.name} for ${company.name}`);
        }
      }
    }
  }
}

