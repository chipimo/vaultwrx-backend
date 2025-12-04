import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { Order, OrderStatus } from '@api/models/Orders/Order';
import { OrderItem, ProductType, GraveType, Gender, CremationType, WitnessType } from '@api/models/Orders/OrderItem';
import { Deceased } from '@api/models/Orders/Deceased';
import { Comment } from '@api/models/Orders/Comment';
import { Product } from '@api/models/Products/Product';
import { Color } from '@api/models/Products/Color';
import { Location } from '@api/models/Products/Location';
import { Company } from '@api/models/Company/Company';
import { Retailer } from '@api/models/Users/Retailer';
import { Customer } from '@api/models/Users/Customer';
import { Staff } from '@api/models/Users/Staff';

export default class CreateOrders implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const orderRepository = connection.getRepository(Order);
    const orderItemRepository = connection.getRepository(OrderItem);
    const deceasedRepository = connection.getRepository(Deceased);
    const commentRepository = connection.getRepository(Comment);
    const productRepository = connection.getRepository(Product);
    const colorRepository = connection.getRepository(Color);
    const locationRepository = connection.getRepository(Location);
    const companyRepository = connection.getRepository(Company);
    const retailerRepository = connection.getRepository(Retailer);
    const customerRepository = connection.getRepository(Customer);
    const staffRepository = connection.getRepository(Staff);

    const companies = await companyRepository.find({ relations: ['retailer'] });
    
    if (companies.length === 0) {
      console.log('No companies found. Please run CreateCompanies seed first.');
      return;
    }

    for (const company of companies) {
      if (!company.retailer_id) continue;

      const retailer = await retailerRepository.findOne({ where: { id: company.retailer_id } });
      if (!retailer) continue;

      const customers = await customerRepository.find({
        where: { company_id: company.id },
        relations: ['user'],
        take: 5,
      });
      if (customers.length === 0) {
        console.log(`No customers found for company ${company.name}. Skipping orders...`);
        continue;
      }

      const staff = await staffRepository.find({ where: { company_id: company.id }, take: 3 });

      const vaultProduct = await productRepository.findOne({
        where: { retailerId: retailer.id, type: ProductType.VAULT, name: 'Continental Vault' },
      });
      const casketProduct = await productRepository.findOne({
        where: { retailerId: retailer.id, type: ProductType.CASKET, name: 'Bronze Casket' },
      });
      const urnProduct = await productRepository.findOne({
        where: { retailerId: retailer.id, type: ProductType.URN, name: 'Bronze Urn' },
      });
      const monumentProduct = await productRepository.findOne({
        where: { retailerId: retailer.id, type: ProductType.MONUMENT, name: 'Granite Monument' },
      });
      const cremationProduct = await productRepository.findOne({
        where: { retailerId: retailer.id, type: ProductType.CREMATION, name: 'Cremation Service' },
      });
      const graveDiggingProduct = await productRepository.findOne({
        where: { retailerId: retailer.id, type: ProductType.GRAVE_DIGGING, name: 'Traditional Grave Digging' },
      });

      if (!vaultProduct || !casketProduct || !urnProduct || !monumentProduct || !cremationProduct || !graveDiggingProduct) {
        console.log(`Required products not found for ${company.name}. Please run CreateProducts seed first.`);
        continue;
      }

      const redColor = await colorRepository.findOne({ where: { name: 'Red', retailerId: retailer.id } });
      const blueColor = await colorRepository.findOne({ where: { name: 'Blue', retailerId: retailer.id } });
      const greenColor = await colorRepository.findOne({ where: { name: 'Green', retailerId: retailer.id } });
      const mahoganyColor = await colorRepository.findOne({ where: { name: 'Mahogany', retailerId: retailer.id } });

      const funeralHomeLocation = await locationRepository.findOne({
        where: { name: 'Funeral Home', retailerId: retailer.id },
      });
      const churchLocation = await locationRepository.findOne({
        where: { name: 'Church', retailerId: retailer.id },
      });
      const graveSiteLocation = await locationRepository.findOne({
        where: { name: 'Grave Site', retailerId: retailer.id },
      });
      const crematoriumLocation = await locationRepository.findOne({
        where: { name: 'Crematorium', retailerId: retailer.id },
      });

      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const nextWeek = new Date(today);
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextMonth = new Date(today);
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      await this.createVaultOrder(
        orderRepository,
        orderItemRepository,
        deceasedRepository,
        commentRepository,
        retailer,
        customers[0],
        staff.length > 0 ? staff[0] : null,
        tomorrow,
        vaultProduct,
        redColor,
        funeralHomeLocation,
        company,
      );

      if (customers.length > 1) {
        await this.createCasketOrder(
          orderRepository,
          orderItemRepository,
          deceasedRepository,
          commentRepository,
          retailer,
          customers[1],
          staff.length > 0 ? staff[0] : null,
          tomorrow,
          casketProduct,
          mahoganyColor,
          funeralHomeLocation,
          company,
        );
      }

      if (customers.length > 2) {
        await this.createUrnOrder(
          orderRepository,
          orderItemRepository,
          deceasedRepository,
          commentRepository,
          retailer,
          customers[2],
          staff.length > 0 ? staff[0] : null,
          tomorrow,
          urnProduct,
          graveSiteLocation,
          company,
        );
      }

      await this.createCremationOrder(
        orderRepository,
        orderItemRepository,
        deceasedRepository,
        commentRepository,
        retailer,
        customers[0],
        staff.length > 0 ? staff[0] : null,
        cremationProduct,
        crematoriumLocation,
        company,
      );

      await this.createMonumentOrder(
        orderRepository,
        orderItemRepository,
        deceasedRepository,
        commentRepository,
        retailer,
        customers[0],
        staff.length > 0 ? staff[0] : null,
        nextMonth,
        monumentProduct,
        graveSiteLocation,
        company,
      );

      await this.createGraveDiggingOrder(
        orderRepository,
        orderItemRepository,
        deceasedRepository,
        commentRepository,
        retailer,
        customers[0],
        staff.length > 0 ? staff[0] : null,
        tomorrow,
        graveDiggingProduct,
        graveSiteLocation,
        company,
      );
    }
  }

  private async createVaultOrder(
    orderRepo: any,
    orderItemRepo: any,
    deceasedRepo: any,
    commentRepo: any,
    retailer: Retailer,
    customer: Customer,
    staff: Staff | null,
    serviceDate: Date,
    vaultProduct: Product,
    paintColor: Color | null,
    location: Location | null,
    company: Company,
  ) {
    const order = orderRepo.create({
      companyId: company.id,
      userId: customer.id,
      retailerId: retailer.id,
      customerId: customer.id,
      staffId: staff?.id || null,
      status: OrderStatus.CONFIRMED,
      total: 1250.00,
      subtotal: 1200.00,
      discount: 0,
      salesTax: 50.00,
      serviceTypeName: 'Traditional',
      serviceTypePrice: 200.00,
      cemetery: 'Pineview Memorial Park',
      locationId: location?.id || null,
      dateOfService: serviceDate,
      timeOfService: '10:00',
      arrivalTime: '09:30',
      contact: customer.user?.first_name + ' ' + customer.user?.last_name,
      email: customer.user?.email,
      cellPhone: customer.phone,
      productPaintColorOptions: 'Red',
      emblem: 'Military',
      isDeleted: false,
      isEdited: false,
      delivered: false,
      confirmed: true,
      comments: 'Standard vault order with red paint and military emblem',
    });

    const savedOrder = await orderRepo.save(order);

    const deceased = deceasedRepo.create({
      orderId: savedOrder.id,
      name: customer.user?.first_name + ' ' + customer.user?.last_name,
      gender: Gender.FEMALE,
      isEmbalmed: true,
    });
    await deceasedRepo.save(deceased);

    const orderItem = orderItemRepo.create({
      orderId: savedOrder.id,
      productId: vaultProduct.id,
      productType: ProductType.VAULT,
      quantity: 1,
      unitPrice: vaultProduct.price,
      totalPrice: vaultProduct.price,
      paintColorId: paintColor?.id || null,
      theme: 'Red',
      engraving: 'Military',
      serviceTime: '10:00',
      serviceDate: serviceDate,
    });
    await orderItemRepo.save(orderItem);

    // Create comment for the order
    const comment = commentRepo.create({
      orderId: savedOrder.id,
      customerId: customer.id,
      comment: 'Please ensure the vault is properly sealed and ready for service.',
      commentType: 'delivery',
    });
    await commentRepo.save(comment);

    console.log(`✅ Created vault order for ${company.name}`);
  }

  private async createCasketOrder(
    orderRepo: any,
    orderItemRepo: any,
    deceasedRepo: any,
    commentRepo: any,
    retailer: Retailer,
    customer: Customer,
    staff: Staff | null,
    serviceDate: Date,
    casketProduct: Product,
    paintColor: Color | null,
    location: Location | null,
    company: Company,
  ) {
    const order = orderRepo.create({
      companyId: company.id,
      userId: customer.id,
      retailerId: retailer.id,
      customerId: customer.id,
      staffId: staff?.id || null,
      status: OrderStatus.CONFIRMED,
      total: 2500.00,
      subtotal: 2400.00,
      discount: 0,
      salesTax: 100.00,
      serviceTypeName: 'Traditional',
      serviceTypePrice: 300.00,
      cemetery: 'Pineview Memorial Park',
      locationId: location?.id || null,
      dateOfService: serviceDate,
      timeOfService: '11:00',
      arrivalTime: '10:30',
      contact: customer.user?.first_name + ' ' + customer.user?.last_name,
      email: customer.user?.email,
      cellPhone: customer.phone,
      productPaintColorOptions: 'Mahogany',
      emblem: 'Cross',
      isDeleted: false,
      isEdited: false,
      delivered: false,
      confirmed: true,
    });

    const savedOrder = await orderRepo.save(order);

    const deceased = deceasedRepo.create({
      orderId: savedOrder.id,
      name: customer.user?.first_name + ' ' + customer.user?.last_name,
      gender: Gender.MALE,
      isEmbalmed: true,
    });
    await deceasedRepo.save(deceased);

    const orderItem = orderItemRepo.create({
      orderId: savedOrder.id,
      productId: casketProduct.id,
      productType: ProductType.CASKET,
      quantity: 1,
      unitPrice: casketProduct.price,
      totalPrice: casketProduct.price,
      paintColorId: paintColor?.id || null,
      theme: 'Mahogany',
      serviceTime: '11:00',
      serviceDate: serviceDate,
    });
    await orderItemRepo.save(orderItem);

    // Create comment for the order
    const comment = commentRepo.create({
      orderId: savedOrder.id,
      customerId: customer.id,
      comment: 'Family requested mahogany finish with traditional styling.',
      commentType: 'customer',
    });
    await commentRepo.save(comment);

    console.log(`✅ Created casket order for ${company.name}`);
  }

  private async createUrnOrder(
    orderRepo: any,
    orderItemRepo: any,
    deceasedRepo: any,
    commentRepo: any,
    retailer: Retailer,
    customer: Customer,
    staff: Staff | null,
    serviceDate: Date,
    urnProduct: Product,
    location: Location | null,
    company: Company,
  ) {
    const order = orderRepo.create({
      companyId: company.id,
      userId: customer.id,
      retailerId: retailer.id,
      customerId: customer.id,
      staffId: staff?.id || null,
      status: OrderStatus.PENDING,
      total: 450.00,
      subtotal: 400.00,
      discount: 0,
      salesTax: 50.00,
      serviceTypeName: 'Cremation',
      serviceTypePrice: 100.00,
      cemetery: 'Pineview Memorial Park',
      locationId: location?.id || null,
      dateOfService: serviceDate,
      timeOfService: '15:00',
      arrivalTime: '14:30',
      contact: customer.user?.first_name + ' ' + customer.user?.last_name,
      email: customer.user?.email,
      cellPhone: customer.phone,
      isDeleted: false,
      isEdited: false,
      delivered: false,
      confirmed: false,
    });

    const savedOrder = await orderRepo.save(order);

    const deceased = deceasedRepo.create({
      orderId: savedOrder.id,
      name: customer.user?.first_name + ' ' + customer.user?.last_name,
      gender: Gender.FEMALE,
      isEmbalmed: false,
    });
    await deceasedRepo.save(deceased);

    const orderItem = orderItemRepo.create({
      orderId: savedOrder.id,
      productId: urnProduct.id,
      productType: ProductType.URN,
      quantity: 1,
      unitPrice: urnProduct.price,
      totalPrice: urnProduct.price,
      deliveryTime: '15:00',
      deliverBy: serviceDate,
      deliveryLocation: 'Pineview Memorial Park',
    });
    await orderItemRepo.save(orderItem);

    // Create comment for the order
    const comment = commentRepo.create({
      orderId: savedOrder.id,
      customerId: customer.id,
      comment: 'Urn needs custom engraving with name and dates.',
      commentType: 'customization',
    });
    await commentRepo.save(comment);

    console.log(`✅ Created urn order for ${company.name}`);
  }

  private async createCremationOrder(
    orderRepo: any,
    orderItemRepo: any,
    deceasedRepo: any,
    commentRepo: any,
    retailer: Retailer,
    customer: Customer,
    staff: Staff | null,
    cremationProduct: Product,
    location: Location | null,
    company: Company,
  ) {
    const order = orderRepo.create({
      companyId: company.id,
      userId: customer.id,
      retailerId: retailer.id,
      customerId: customer.id,
      staffId: staff?.id || null,
      status: OrderStatus.COMPLETED,
      total: 850.00,
      subtotal: 800.00,
      discount: 0,
      salesTax: 50.00,
      serviceTypeName: 'Cremation Service',
      serviceTypePrice: 200.00,
      cemetery: 'Pineview Memorial Park',
      locationId: location?.id || null,
      contact: customer.user?.first_name + ' ' + customer.user?.last_name,
      email: customer.user?.email,
      cellPhone: customer.phone,
      isDeleted: false,
      isEdited: false,
      delivered: false,
      confirmed: true,
      comments: 'Cremation complete, ready for return',
    });

    const savedOrder = await orderRepo.save(order);

    const deceased = deceasedRepo.create({
      orderId: savedOrder.id,
      name: customer.user?.first_name + ' ' + customer.user?.last_name,
      gender: Gender.MALE,
      isEmbalmed: false,
      weight: '180',
      height: '6\'0"',
    });
    await deceasedRepo.save(deceased);

    const orderItem = orderItemRepo.create({
      orderId: savedOrder.id,
      productId: cremationProduct.id,
      productType: ProductType.CREMATION,
      quantity: 1,
      unitPrice: cremationProduct.price,
      totalPrice: cremationProduct.price,
      cremationType: CremationType.PICKUP,
      witnessesPresent: true,
      witnessType: WitnessType.ENTIRE_PROCESS,
      cremainsContainer: 'Bronze Urn',
      height: '6\'0"',
      weight: '180',
      gender: Gender.MALE,
    });
    await orderItemRepo.save(orderItem);

    // Create comment for the order
    const comment = commentRepo.create({
      orderId: savedOrder.id,
      customerId: customer.id,
      comment: 'Cremation completed successfully. Family will pick up cremains next week.',
      commentType: 'internal',
    });
    await commentRepo.save(comment);

    console.log(`✅ Created cremation order for ${company.name}`);
  }

  private async createMonumentOrder(
    orderRepo: any,
    orderItemRepo: any,
    deceasedRepo: any,
    commentRepo: any,
    retailer: Retailer,
    customer: Customer,
    staff: Staff | null,
    serviceDate: Date,
    monumentProduct: Product,
    location: Location | null,
    company: Company,
  ) {
    const order = orderRepo.create({
      companyId: company.id,
      userId: customer.id,
      retailerId: retailer.id,
      customerId: customer.id,
      staffId: staff?.id || null,
      status: OrderStatus.CONFIRMED,
      total: 3500.00,
      subtotal: 3400.00,
      discount: 0,
      salesTax: 100.00,
      serviceTypeName: 'Installation',
      serviceTypePrice: 300.00,
      cemetery: 'Pineview Memorial Park',
      locationId: location?.id || null,
      dateOfService: serviceDate,
      timeOfService: '10:00',
      arrivalTime: '09:30',
      contact: customer.user?.first_name + ' ' + customer.user?.last_name,
      email: customer.user?.email,
      cellPhone: customer.phone,
      isDeleted: false,
      isEdited: false,
      delivered: false,
      confirmed: true,
      comments: 'Monument with fixed installation date',
    });

    const savedOrder = await orderRepo.save(order);

    const deceased = deceasedRepo.create({
      orderId: savedOrder.id,
      name: customer.user?.first_name + ' ' + customer.user?.last_name,
      gender: Gender.MALE,
      isEmbalmed: false,
    });
    await deceasedRepo.save(deceased);

    const orderItem = orderItemRepo.create({
      orderId: savedOrder.id,
      productId: monumentProduct.id,
      productType: ProductType.MONUMENT,
      quantity: 1,
      unitPrice: monumentProduct.price,
      totalPrice: monumentProduct.price,
      requestedCompletionDate: serviceDate,
      cemetery: 'Pineview Memorial Park',
      lastDayLettering: true,
      monumentInPlace: false,
    });
    await orderItemRepo.save(orderItem);

    // Create comment for the order
    const comment = commentRepo.create({
      orderId: savedOrder.id,
      customerId: customer.id,
      comment: 'Monument installation scheduled. Please confirm site preparation is complete.',
      commentType: 'delivery',
    });
    await commentRepo.save(comment);

    console.log(`✅ Created monument order for ${company.name}`);
  }

  private async createGraveDiggingOrder(
    orderRepo: any,
    orderItemRepo: any,
    deceasedRepo: any,
    commentRepo: any,
    retailer: Retailer,
    customer: Customer,
    staff: Staff | null,
    serviceDate: Date,
    graveDiggingProduct: Product,
    location: Location | null,
    company: Company,
  ) {
    const order = orderRepo.create({
      companyId: company.id,
      userId: customer.id,
      retailerId: retailer.id,
      customerId: customer.id,
      staffId: staff?.id || null,
      status: OrderStatus.CONFIRMED,
      total: 1200.00,
      subtotal: 1150.00,
      discount: 0,
      salesTax: 50.00,
      serviceTypeName: 'Grave Digging',
      serviceTypePrice: 250.00,
      cemetery: 'Pineview Memorial Park',
      locationId: location?.id || null,
      dateOfService: serviceDate,
      timeOfService: '08:30',
      arrivalTime: '08:00',
      contact: customer.user?.first_name + ' ' + customer.user?.last_name,
      email: customer.user?.email,
      cellPhone: customer.phone,
      isDeleted: false,
      isEdited: false,
      delivered: false,
      confirmed: true,
    });

    const savedOrder = await orderRepo.save(order);

    const deceased = deceasedRepo.create({
      orderId: savedOrder.id,
      name: customer.user?.first_name + ' ' + customer.user?.last_name,
      gender: Gender.FEMALE,
      isEmbalmed: true,
    });
    await deceasedRepo.save(deceased);

    const orderItem = orderItemRepo.create({
      orderId: savedOrder.id,
      productId: graveDiggingProduct.id,
      productType: ProductType.GRAVE_DIGGING,
      quantity: 1,
      unitPrice: graveDiggingProduct.price,
      totalPrice: graveDiggingProduct.price,
      graveType: GraveType.TRADITIONAL,
      cemetery: 'Pineview Memorial Park',
      serviceTime: '08:30',
      serviceDate: serviceDate,
      graveOpeningClosing: true,
    });
    await orderItemRepo.save(orderItem);

    // Create comment for the order
    const comment = commentRepo.create({
      orderId: savedOrder.id,
      customerId: customer.id,
      comment: 'Grave digging scheduled for early morning. Please ensure equipment is ready.',
      commentType: 'delivery',
    });
    await commentRepo.save(comment);

    console.log(`✅ Created grave digging order for ${company.name}`);
  }
}

