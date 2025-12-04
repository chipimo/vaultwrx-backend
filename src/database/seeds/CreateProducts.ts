import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { Product, ProductType } from '@api/models/Products/Product';
import { Color, ColorType } from '@api/models/Products/Color';
import { Location } from '@api/models/Products/Location';
import { ServiceExtra } from '@api/models/Products/ServiceExtra';
import { Retailer } from '@api/models/Users/Retailer';
import { Company } from '@api/models/Company/Company';
import { Vault } from '@api/models/Products/Vault';
import { Casket } from '@api/models/Products/Casket';
import { Urn } from '@api/models/Products/Urn';
import { GraveDigging, BurialType, GraveSize } from '@api/models/Products/GraveDigging';
import { Cremation, CremainsContainerType } from '@api/models/Products/Cremation';
import { Monument } from '@api/models/Products/Monument';
import { BulkPrecast } from '@api/models/Products/BulkPrecast';
import { CremationType, WitnessType } from '@api/models/Orders/OrderItem';
import { ServiceType } from '@api/models/Orders/Order';

export default class CreateProducts implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const productRepository = connection.getRepository(Product);
    const colorRepository = connection.getRepository(Color);
    const locationRepository = connection.getRepository(Location);
    const serviceExtraRepository = connection.getRepository(ServiceExtra);
    const companyRepository = connection.getRepository(Company);
    const retailerRepository = connection.getRepository(Retailer);
    const vaultRepository = connection.getRepository(Vault);
    const casketRepository = connection.getRepository(Casket);
    const urnRepository = connection.getRepository(Urn);
    const graveDiggingRepository = connection.getRepository(GraveDigging);
    const cremationRepository = connection.getRepository(Cremation);
    const monumentRepository = connection.getRepository(Monument);
    const bulkPrecastRepository = connection.getRepository(BulkPrecast);

    // Get companies with retailers
    const companies = await companyRepository.find({ relations: ['retailer'] });
    
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies and CreateRetailers seeds first.');
      return;
    }

    for (const company of companies) {
      if (!company.retailer_id) {
        console.log(`Company ${company.name} has no retailer. Skipping...`);
        continue;
      }

      const retailer = await retailerRepository.findOne({ where: { id: company.retailer_id } });
      if (!retailer) continue;

      // Create colors first
      const colors = [
        { name: 'Red', hexCode: '#FF0000', type: ColorType.PAINT_COLOR },
        { name: 'Blue', hexCode: '#0000FF', type: ColorType.PAINT_COLOR },
        { name: 'Green', hexCode: '#008000', type: ColorType.PAINT_COLOR },
        { name: 'Mahogany', hexCode: '#800000', type: ColorType.PAINT_COLOR },
        { name: 'Grey', hexCode: '#808080', type: ColorType.PAINT_COLOR },
        { name: 'Concrete', hexCode: '#C0C0C0', type: ColorType.PAINT_COLOR },
        { name: 'Silver', hexCode: '#C0C0C0', type: ColorType.PAINT_COLOR },
        { name: 'White', hexCode: '#FFFFFF', type: ColorType.PAINT_COLOR },
        { name: 'Black', hexCode: '#000000', type: ColorType.PAINT_COLOR },
      ];

      for (const colorData of colors) {
        const existingColor = await colorRepository.findOne({
          where: { name: colorData.name, retailerId: retailer.id },
        });

        if (!existingColor) {
          const color = colorRepository.create({
            ...colorData,
            companyId: company.id,
            retailerId: retailer.id,
            isActive: true,
          });
          await colorRepository.save(color);
          console.log(`✅ Created color: ${colorData.name} for ${company.name}`);
        }
      }

      // Create locations
      const locationNames = ['Funeral Home', 'Church', 'Grave Site', 'Delivery', 'Cemetery', 'Crematorium', 'Other'];

      for (const locationName of locationNames) {
        const existingLocation = await locationRepository.findOne({
          where: { name: locationName, retailerId: retailer.id },
        });

        if (!existingLocation) {
          const location = locationRepository.create({
            companyId: company.id,
            retailerId: retailer.id,
            name: locationName,
            address: company.address,
            city: 'Springfield',
            state: 'IL',
            zipCode: '62701',
            phone: company.phone,
            email: company.email,
            isActive: true,
          });
          await locationRepository.save(location);
          console.log(`✅ Created location: ${locationName} for ${company.name}`);
        }
      }

      // Create service extras
      const serviceExtras = [
        { name: 'Custom Engraving', description: 'Custom text engraving', price: 150.00, category: 'Customization' },
        { name: 'Rush Delivery', description: 'Expedited delivery service', price: 200.00, category: 'Delivery' },
        { name: 'Setup Service', description: 'Professional setup and installation', price: 100.00, category: 'Setup' },
        { name: 'Emblem Application', description: 'Apply custom emblem', price: 75.00, category: 'Customization' },
      ];

      for (const extraData of serviceExtras) {
        const existingExtra = await serviceExtraRepository.findOne({
          where: { name: extraData.name, retailerId: retailer.id },
        });

        if (!existingExtra) {
          const serviceExtra = serviceExtraRepository.create({
            ...extraData,
            companyId: company.id,
            retailerId: retailer.id,
            isActive: true,
          });
          await serviceExtraRepository.save(serviceExtra);
          console.log(`✅ Created service extra: ${extraData.name} for ${company.name}`);
        }
      }

      // Create products
      const products = [
        // Vaults
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Continental Vault',
          type: ProductType.VAULT,
          category: 'Premium',
          price: 1200.00,
          quantity: 80,
          description: 'Premium continental vault with standard features',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Standard Vault',
          type: ProductType.VAULT,
          category: 'Standard',
          price: 1000.00,
          quantity: 100,
          description: 'Standard vault for traditional services',
          isActive: true,
        },
        // Caskets
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Bronze Casket',
          type: ProductType.CASKET,
          category: 'Premium',
          price: 2400.00,
          quantity: 50,
          description: 'Premium bronze casket with elegant finish',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Mahogany Casket',
          type: ProductType.CASKET,
          category: 'Premium',
          price: 2200.00,
          quantity: 40,
          description: 'Traditional mahogany wood casket',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Oak Casket',
          type: ProductType.CASKET,
          category: 'Standard',
          price: 1800.00,
          quantity: 60,
          description: 'Classic oak wood casket',
          isActive: true,
        },
        // Urns
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Bronze Urn',
          type: ProductType.URN,
          category: 'Standard',
          price: 400.00,
          quantity: 200,
          description: 'Elegant bronze cremation urn',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Ceramic Urn',
          type: ProductType.URN,
          category: 'Standard',
          price: 350.00,
          quantity: 150,
          description: 'Beautiful ceramic cremation urn',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Marble Urn',
          type: ProductType.URN,
          category: 'Premium',
          price: 600.00,
          quantity: 100,
          description: 'Premium marble cremation urn',
          isActive: true,
        },
        // Monuments
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Granite Monument',
          type: ProductType.MONUMENT,
          category: 'Premium',
          price: 3100.00,
          quantity: 0,
          description: 'Custom granite monument with engraving',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Marble Monument',
          type: ProductType.MONUMENT,
          category: 'Premium',
          price: 3500.00,
          quantity: 0,
          description: 'Elegant marble monument',
          isActive: true,
        },
        // Cremations
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Cremation Service',
          type: ProductType.CREMATION,
          category: 'Service',
          price: 825.00,
          quantity: 0,
          description: 'Complete cremation service with documentation',
          isActive: true,
        },
        // Grave Digging
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Traditional Grave Digging',
          type: ProductType.GRAVE_DIGGING,
          category: 'Service',
          price: 1150.00,
          quantity: 0,
          description: 'Traditional grave opening and closing service',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Adult Grave Digging',
          type: ProductType.GRAVE_DIGGING,
          category: 'Service',
          price: 1000.00,
          quantity: 0,
          description: 'Adult-sized grave digging service',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Oversized Grave Digging',
          type: ProductType.GRAVE_DIGGING,
          category: 'Service',
          price: 1300.00,
          quantity: 0,
          description: 'Oversized grave digging service',
          isActive: true,
        },
        // Bulk/Precast
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Concrete Precast Block',
          type: ProductType.BULK_PRECAST,
          category: 'Bulk',
          price: 450.00,
          quantity: 0,
          description: 'Standard concrete precast block',
          isActive: true,
        },
        {
          companyId: company.id,
          retailerId: retailer.id,
          name: 'Reinforced Precast Slab',
          type: ProductType.BULK_PRECAST,
          category: 'Bulk',
          price: 550.00,
          quantity: 0,
          description: 'Reinforced precast concrete slab',
          isActive: true,
        },
      ];

      for (const productData of products) {
        const existingProduct = await productRepository.findOne({
          where: {
            name: productData.name,
            retailerId: retailer.id,
            type: productData.type,
          },
        });

        if (!existingProduct) {
          const product = productRepository.create(productData);
          await productRepository.save(product);
          console.log(`✅ Created product: ${productData.name} (${productData.type}) for ${company.name}`);

          // Create product type specific records
          try {
            switch (productData.type) {
              case ProductType.VAULT:
                const vault = vaultRepository.create({
                  productId: product.id,
                  cemeteryName: 'Pineview Memorial Park',
                  cemeteryState: 'IL',
                  funeralServiceType: null,
                  hasCustomization: false,
                });
                await vaultRepository.save(vault);
                console.log(`  ✅ Created vault details for ${productData.name}`);
                break;

              case ProductType.CASKET:
                const casket = casketRepository.create({
                  productId: product.id,
                  productName: productData.name,
                  theme: 'Traditional',
                });
                await casketRepository.save(casket);
                console.log(`  ✅ Created casket details for ${productData.name}`);
                break;

              case ProductType.URN:
                const urn = urnRepository.create({
                  productId: product.id,
                  hasEngraving: false,
                  hasCustomization: false,
                });
                await urnRepository.save(urn);
                console.log(`  ✅ Created urn details for ${productData.name}`);
                break;

              case ProductType.GRAVE_DIGGING:
                // Determine grave size based on product name
                let graveSize = GraveSize.TRADITIONAL;
                if (productData.name.includes('Adult')) {
                  graveSize = GraveSize.ADULT;
                } else if (productData.name.includes('Oversized')) {
                  graveSize = GraveSize.OVERSIZED;
                }

                const graveDigging = graveDiggingRepository.create({
                  productId: product.id,
                  burialType: BurialType.TRADITIONAL,
                  graveSize: graveSize,
                  graveOpeningAndClosing: true,
                  graveOpeningOnly: false,
                  graveClosingOnly: false,
                  monumentInPlace: false,
                });
                await graveDiggingRepository.save(graveDigging);
                console.log(`  ✅ Created grave digging details for ${productData.name}`);
                break;

              case ProductType.CREMATION:
                const cremation = cremationRepository.create({
                  productId: product.id,
                  arrivalMethod: CremationType.PICKUP,
                  witnessesPresent: false,
                  cremainsContainerTypes: [CremainsContainerType.URN_BY_COMPANY],
                });
                await cremationRepository.save(cremation);
                console.log(`  ✅ Created cremation details for ${productData.name}`);
                break;

              case ProductType.MONUMENT:
                const monument = monumentRepository.create({
                  productId: product.id,
                  lastDayLettering: false,
                });
                await monumentRepository.save(monument);
                console.log(`  ✅ Created monument details for ${productData.name}`);
                break;

              case ProductType.BULK_PRECAST:
                const bulkPrecast = bulkPrecastRepository.create({
                  productId: product.id,
                  productName: productData.name,
                  quantity: 1,
                });
                await bulkPrecastRepository.save(bulkPrecast);
                console.log(`  ✅ Created bulk/precast details for ${productData.name}`);
                break;
            }
          } catch (error) {
            console.error(`  ❌ Error creating product type details for ${productData.name}:`, error);
          }
        }
      }
    }
  }
}

