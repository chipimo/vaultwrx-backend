import { CronController as CronJobClass, Cron } from 'cron-decorators';
import { Service as Injectable } from 'typedi';
import { getConnection } from 'typeorm';
import { Order } from '@api/models/Orders/Order';
import { OrderHistory } from '@api/models/Orders/OrderHistory';
import { OrderItem } from '@api/models/Orders/OrderItem';
import { Deceased } from '@api/models/Orders/Deceased';
import { Photo } from '@api/models/Orders/Photo';
import { OrderExtraCharge } from '@api/models/Orders/OrderExtraCharge';
import { OrderContact } from '@api/models/Orders/OrderContact';
import { Comment } from '@api/models/Orders/Comment';
import { ProductType } from '@api/models/Products/Product';
import { env } from '@base/utils/env';

const BATCH_SIZE = parseInt(env('BATCH_SIZE_ORDER_HISTORY') || '500', 10);

const PRODUCT_TYPES = new Set<string>(Object.values(ProductType));

function deriveOrderType(orderItems: OrderItem[]): string | null {
  if (!orderItems || orderItems.length === 0) return null;
  const first = orderItems[0]?.productType;
  if (first && PRODUCT_TYPES.has(first)) return first;
  const counts: Record<string, number> = {};
  for (const item of orderItems) {
    const t = item?.productType;
    if (t && PRODUCT_TYPES.has(t)) {
      counts[t] = (counts[t] || 0) + 1;
    }
  }
  let maxCount = 0;
  let majority: string | null = null;
  for (const [type, count] of Object.entries(counts)) {
    if (count > maxCount) {
      maxCount = count;
      majority = type;
    }
  }
  return majority ?? first ?? null;
}

function orderToOrderHistory(order: Order, orderType: string | null): OrderHistory {
  const h = new OrderHistory();
  h.id = order.id;
  h.companyId = order.companyId;
  h.userId = order.userId;
  h.retailerId = order.retailerId;
  h.customerId = order.customerId;
  h.directorId = order.directorId;
  h.staffId = order.staffId;
  h.status = order.status;
  h.total = order.total;
  h.subtotal = order.subtotal;
  h.discount = order.discount;
  h.salesTax = order.salesTax;
  h.applyPlatformFee = order.applyPlatformFee;
  h.serviceTypeName = order.serviceTypeName;
  h.serviceTypePrice = order.serviceTypePrice;
  h.cemetery = order.cemetery;
  h.locationId = order.locationId;
  h.dateOfService = order.dateOfService;
  h.timeOfService = order.timeOfService;
  h.arrivalTime = order.arrivalTime;
  h.contact = order.contact;
  h.email = order.email;
  h.cellPhone = order.cellPhone;
  h.isDeleted = order.isDeleted;
  h.isEdited = order.isEdited;
  h.isParent = order.isParent;
  h.delivered = order.delivered;
  h.confirmed = order.confirmed;
  h.newOrderNotificationsSent = order.newOrderNotificationsSent;
  h.comments = order.comments;
  h.deliveryInstructions = order.deliveryInstructions;
  h.orderDStatus = order.orderDStatus;
  h.productPaintColorOptions = order.productPaintColorOptions;
  h.serviceExtras = order.serviceExtras;
  h.storeName = order.storeName;
  h.storeAddress1 = order.storeAddress1;
  h.storeAddress2 = order.storeAddress2;
  h.storeCity = order.storeCity;
  h.storeState = order.storeState;
  h.storeZip = order.storeZip;
  h.trackingColor = order.trackingColor;
  h.createdAt = order.createdAt;
  h.updatedAt = order.updatedAt;
  h.archivedAt = new Date();
  h.orderType = orderType;
  return h;
}

@Injectable()
@CronJobClass()
export class OrderHistoryArchiveCronJob {
  @Cron('Archive past orders to order_history at 2 AM daily', '0 2 * * *')
  public async handle(): Promise<void> {
    const connection = getConnection();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const orderRepo = connection.getRepository(Order);
    const orderHistoryRepo = connection.getRepository(OrderHistory);

    const existingRows = await orderHistoryRepo.find({ select: ['id'] });
    const idsToSkip = new Set(existingRows.map((r) => r.id));

    let processed = 0;
    let hasMore = true;

    while (hasMore) {
      const qb = orderRepo
        .createQueryBuilder('order')
        .leftJoinAndSelect('order.orderItems', 'orderItems')
        .where('order.date_of_service < :today', { today })
        .andWhere('order.is_deleted = :isDeleted', { isDeleted: false })
        .orderBy('order.dateOfService', 'ASC')
        .take(BATCH_SIZE);

      const orders = await qb.getMany();
      const batch = orders.filter((o) => !idsToSkip.has(o.id));
      hasMore = orders.length === BATCH_SIZE;

      if (batch.length === 0) {
        if (orders.length < BATCH_SIZE) break;
        for (const o of orders) idsToSkip.add(o.id);
        continue;
      }

      const batchIds = batch.map((o) => o.id);

      const queryRunner = connection.createQueryRunner();
      await queryRunner.connect();
      await queryRunner.startTransaction();
      try {
        for (const order of batch) {
          const orderType = deriveOrderType(order.orderItems || []);
          const historyRow = orderToOrderHistory(order, orderType);
          await queryRunner.manager.save(OrderHistory, historyRow);
        }

        await queryRunner.manager
          .createQueryBuilder()
          .update(OrderItem)
          .set({ orderHistoryId: () => 'order_id', orderId: null as any })
          .where('order_id IN (:...ids)', { ids: batchIds })
          .execute();
        await queryRunner.manager
          .createQueryBuilder()
          .update(Deceased)
          .set({ orderHistoryId: () => 'order_id', orderId: null as any })
          .where('order_id IN (:...ids)', { ids: batchIds })
          .execute();
        await queryRunner.manager
          .createQueryBuilder()
          .update(Photo)
          .set({ orderHistoryId: () => 'order_id', orderId: null as any })
          .where('order_id IN (:...ids)', { ids: batchIds })
          .execute();
        await queryRunner.manager
          .createQueryBuilder()
          .update(OrderExtraCharge)
          .set({ orderHistoryId: () => 'order_id', orderId: null as any })
          .where('order_id IN (:...ids)', { ids: batchIds })
          .execute();
        await queryRunner.manager
          .createQueryBuilder()
          .update(OrderContact)
          .set({ orderHistoryId: () => 'order_id', orderId: null as any })
          .where('order_id IN (:...ids)', { ids: batchIds })
          .execute();
        await queryRunner.manager
          .createQueryBuilder()
          .update(Comment)
          .set({ orderHistoryId: () => 'order_id', orderId: null as any })
          .where('order_id IN (:...ids)', { ids: batchIds })
          .execute();

        await queryRunner.manager.delete(Order, batchIds);
        await queryRunner.commitTransaction();
        processed += batch.length;
        for (const id of batchIds) idsToSkip.add(id);
      } catch (err) {
        await queryRunner.rollbackTransaction();
        throw err;
      } finally {
        await queryRunner.release();
      }
    }

    if (processed > 0) {
      console.log(`OrderHistoryArchiveCronJob: archived ${processed} orders.`);
    }
  }
}
