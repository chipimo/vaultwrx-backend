/**
 * Generate 1000 past orders (date_of_service < today) for performance testing.
 * These will show in the order history after running the archive job.
 * Usage: npm run seed-past-orders
 */

require('dotenv').config();
require('../fix-module-alias');

import 'reflect-metadata';
import { createConnection } from 'typeorm';
import { dbConfig } from '@base/config/db';
import { Order, OrderStatus } from '@api/models/Orders/Order';
import { OrderItem, ProductType, Gender } from '@api/models/Orders/OrderItem';
import { Deceased } from '@api/models/Orders/Deceased';
import { Company } from '@api/models/Company/Company';
import { Customer } from '@api/models/Users/Customer';
import { Staff } from '@api/models/Users/Staff';
import { Product } from '@api/models/Products/Product';
import { Location } from '@api/models/Products/Location';

const TARGET_COUNT = 1000;
const BATCH_SIZE = 50;

const PRODUCT_TYPES = [
  ProductType.VAULT,
  ProductType.CASKET,
  ProductType.URN,
  ProductType.CREMATION,
  ProductType.MONUMENT,
  ProductType.GRAVE_DIGGING,
] as const;

const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Linda', 'William', 'Elizabeth', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Wilson', 'Anderson', 'Taylor', 'Thomas', 'Moore'];
const CEMETERIES = ['Pineview Memorial', 'Oak Hill Cemetery', 'Greenwood Gardens', 'Sunset Rest', 'Peaceful Valley', 'Memorial Park'];
const SERVICE_NAMES = ['Traditional', 'Cremation', 'Memorial', 'Graveside', 'Direct Burial'];

function randomInt(max: number): number {
  return Math.floor(Math.random() * max);
}

function randomChoice<T>(arr: readonly T[]): T {
  return arr[randomInt(arr.length)];
}

function randomPastDate(daysBackMin: number, daysBackMax: number): Date {
  const daysBack = daysBackMin + randomInt(daysBackMax - daysBackMin + 1);
  const d = new Date();
  d.setDate(d.getDate() - daysBack);
  d.setHours(0, 0, 0, 0);
  return d;
}

function timeString(hour: number, minute: number): string {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`;
}

async function run() {
  const connection = await createConnection({ ...dbConfig });
  const orderRepo = connection.getRepository(Order);
  const orderItemRepo = connection.getRepository(OrderItem);
  const deceasedRepo = connection.getRepository(Deceased);
  const companyRepo = connection.getRepository(Company);
  const customerRepo = connection.getRepository(Customer);
  const staffRepo = connection.getRepository(Staff);
  const productRepo = connection.getRepository(Product);
  const locationRepo = connection.getRepository(Location);

  const companies = await companyRepo.find({ where: {}, take: 1 });
  if (companies.length === 0) {
    console.error('No company found. Run company/customer seeds first.');
    await connection.close();
    process.exit(1);
  }
  const company = companies[0];
  const companyId = company.id;

  const customers = await customerRepo.find({
    where: { company_id: companyId },
    take: 20,
  });
  if (customers.length === 0) {
    console.error('No customers found for company. Run CreateOrders or customer seed first.');
    await connection.close();
    process.exit(1);
  }

  const staffList = await staffRepo.find({
    where: { company_id: companyId },
    take: 5,
  });

  const productsByType: Partial<Record<string, Product>> = {};
  for (const pt of PRODUCT_TYPES) {
    const products = await productRepo.find({
      where: { type: pt as any },
      take: 1,
    });
    if (products.length > 0) productsByType[pt] = products[0];
  }
  const productEntries = Object.entries(productsByType).filter(([, p]) => p != null) as [string, Product][];
  if (productEntries.length === 0) {
    console.error('No products found. Run CreateProducts seed first.');
    await connection.close();
    process.exit(1);
  }

  const locations = await locationRepo.find({
    where: { companyId },
    take: 5,
  });
  const locationId = locations.length > 0 ? locations[0].id : null;

  const retailerId = company.retailer_id ?? null;
  if (!retailerId) {
    console.warn('Company has no retailer_id; orders will have retailerId null.');
  }

  console.log(`Seeding ${TARGET_COUNT} past orders for company ${company.name}...`);
  const start = Date.now();
  let created = 0;

  for (let batchStart = 0; batchStart < TARGET_COUNT; batchStart += BATCH_SIZE) {
    const batchCount = Math.min(BATCH_SIZE, TARGET_COUNT - batchStart);
    await connection.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const orderItemRepository = manager.getRepository(OrderItem);
      const deceasedRepository = manager.getRepository(Deceased);

      for (let i = 0; i < batchCount; i++) {
        const customer = randomChoice(customers);
        const staff = staffList.length > 0 ? randomChoice(staffList) : null;
        const [productType, product] = randomChoice(productEntries);
        const dateOfService = randomPastDate(1, 730); // 1 day to 2 years ago
        const hour = 8 + randomInt(8);
        const minute = randomInt(2) * 30;

        const order = orderRepository.create({
          companyId,
          userId: customer.user_id ?? null,
          retailerId,
          customerId: customer.id,
          staffId: staff?.id ?? null,
          directorId: null,
          status: OrderStatus.COMPLETED,
          total: Number(product.price) * 1.1,
          subtotal: Number(product.price),
          discount: 0,
          salesTax: Number(product.price) * 0.1,
          applyPlatformFee: false,
          serviceTypeName: randomChoice(SERVICE_NAMES),
          serviceTypePrice: 200,
          cemetery: randomChoice(CEMETERIES),
          locationId,
          dateOfService,
          timeOfService: timeString(hour, minute),
          arrivalTime: timeString(hour - 1, 0),
          contact: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
          email: `contact${batchStart + i}@example.com`,
          cellPhone: '555-0100',
          isDeleted: false,
          isEdited: false,
          isParent: false,
          delivered: true,
          confirmed: true,
          newOrderNotificationsSent: true,
          comments: null,
          deliveryInstructions: null,
        });
        const savedOrder = await orderRepository.save(order);

        const orderItem = orderItemRepository.create({
          orderId: savedOrder.id,
          productId: product.id,
          productType: productType as ProductType,
          quantity: 1,
          unitPrice: product.price,
          totalPrice: product.price,
          serviceDate: dateOfService,
          serviceTime: timeString(hour, minute),
        });
        await orderItemRepository.save(orderItem);

        const deceased = deceasedRepository.create({
          orderId: savedOrder.id,
          name: `${randomChoice(FIRST_NAMES)} ${randomChoice(LAST_NAMES)}`,
          gender: randomChoice([Gender.MALE, Gender.FEMALE]),
        });
        await deceasedRepository.save(deceased);
        created++;
      }
    });
    process.stdout.write(`\r  Created ${created}/${TARGET_COUNT} orders...`);
  }

  const elapsed = ((Date.now() - start) / 1000).toFixed(1);
  console.log(`\nDone. Created ${created} past orders in ${elapsed}s.`);
  await connection.close();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
