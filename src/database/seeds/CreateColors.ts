import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { Color, ColorType } from '@api/models/Products/Color';
import { Retailer } from '@api/models/Users/Retailer';
import { Company } from '@api/models/Company/Company';

export default class CreateColors implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const colorRepository = connection.getRepository(Color);
    const companyRepository = connection.getRepository(Company);
    const retailerRepository = connection.getRepository(Retailer);

    // Get companies with retailers
    const companies = await companyRepository.find({ relations: ['retailer'] });
    
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies and CreateRetailers seeds first.');
      return;
    }

    const colors = [
      // Paint colors
      { name: 'Red', hexCode: '#FF0000', type: ColorType.PAINT_COLOR, description: 'Classic red paint color' },
      { name: 'Blue', hexCode: '#0000FF', type: ColorType.PAINT_COLOR, description: 'Deep blue paint color' },
      { name: 'Green', hexCode: '#008000', type: ColorType.PAINT_COLOR, description: 'Forest green paint color' },
      { name: 'Mahogany', hexCode: '#800000', type: ColorType.PAINT_COLOR, description: 'Rich mahogany paint color' },
      { name: 'Grey', hexCode: '#808080', type: ColorType.PAINT_COLOR, description: 'Classic grey paint color' },
      { name: 'Concrete', hexCode: '#C0C0C0', type: ColorType.PAINT_COLOR, description: 'Natural concrete color' },
      { name: 'Silver', hexCode: '#C0C0C0', type: ColorType.PAINT_COLOR, description: 'Metallic silver paint color' },
      { name: 'White', hexCode: '#FFFFFF', type: ColorType.PAINT_COLOR, description: 'Pure white paint color' },
      { name: 'Black', hexCode: '#000000', type: ColorType.PAINT_COLOR, description: 'Classic black paint color' },
      { name: 'Bronze', hexCode: '#CD7F32', type: ColorType.PAINT_COLOR, description: 'Antique bronze paint color' },
      { name: 'Gold', hexCode: '#FFD700', type: ColorType.PAINT_COLOR, description: 'Metallic gold paint color' },
      { name: 'Cream', hexCode: '#FFFDD0', type: ColorType.PAINT_COLOR, description: 'Soft cream paint color' },
      { name: 'Navy', hexCode: '#000080', type: ColorType.PAINT_COLOR, description: 'Navy blue paint color' },
      { name: 'Burgundy', hexCode: '#800020', type: ColorType.PAINT_COLOR, description: 'Deep burgundy paint color' },
      // Location colors
      { name: 'Cemetery Grey', hexCode: '#6B6B6B', type: ColorType.LOCATION_COLOR, description: 'Standard cemetery grey' },
      { name: 'Memorial White', hexCode: '#F5F5F5', type: ColorType.LOCATION_COLOR, description: 'Memorial stone white' },
      { name: 'Granite Black', hexCode: '#1C1C1C', type: ColorType.LOCATION_COLOR, description: 'Black granite color' },
    ];

    for (const company of companies) {
      if (!company.retailer_id) {
        console.log(`Company ${company.name} has no retailer. Skipping colors...`);
        continue;
      }

      const retailer = await retailerRepository.findOne({ where: { id: company.retailer_id } });
      if (!retailer) continue;

      for (const colorData of colors) {
        const existingColor = await colorRepository.findOne({
          where: { name: colorData.name, companyId: company.id },
        });

        if (!existingColor) {
          const color = colorRepository.create({
            ...colorData,
            companyId: company.id,
            retailerId: retailer.id,
            isActive: true,
          });
          await colorRepository.save(color);
          console.log(`  ✅ Created color: ${colorData.name} (${colorData.type}) for ${company.name}`);
        }
      }
    }
  }
}

