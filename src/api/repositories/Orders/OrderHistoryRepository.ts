import { OrderHistory } from '@api/models/Orders/OrderHistory';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { deduplicateObjects } from '@base/infrastructure/utils/deduplicateObjects';
import { ProductType } from '@api/models/Products/Product';

const MAX_PAGE_SIZE = 100;

export interface OrderHistoryFilters {
  orderType?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderHistoryPagination {
  page?: number;
  limit?: number;
  skip?: number;
  take?: number;
}

@EntityRepository(OrderHistory)
export class OrderHistoryRepository extends RepositoryBase<OrderHistory> {
  /**
   * Paginated list of order history. Max page size 100.
   * Filters: companyId, optional orderType, dateFrom, dateTo.
   */
  public async getHistoryManyAndCount(
    companyId: string,
    filters?: OrderHistoryFilters,
    pagination?: OrderHistoryPagination
  ): Promise<{ total_data: number; rows: OrderHistory[] }> {
    const take = Math.min(
      pagination?.take ?? pagination?.limit ?? 10,
      MAX_PAGE_SIZE
    );
    const skip = pagination?.skip ?? (pagination?.page != null ? (pagination.page - 1) * take : 0);

    const queryBuilder = this.createQueryBuilder('orderHistory')
      .leftJoinAndSelect('orderHistory.company', 'company')
      .leftJoinAndSelect('orderHistory.location', 'location')
      .leftJoinAndSelect('orderHistory.user', 'user')
      .leftJoinAndSelect('user.company', 'userCompany')
      .leftJoinAndSelect('orderHistory.retailer', 'retailer')
      .leftJoinAndSelect('retailer.user', 'retailerUser')
      .leftJoinAndSelect('retailer.company', 'retailerCompany')
      .leftJoinAndSelect('orderHistory.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('customer.company', 'customerCompany')
      .leftJoinAndSelect('orderHistory.director', 'director')
      .leftJoinAndSelect('director.user', 'directorUser')
      .leftJoinAndSelect('director.company', 'directorCompany')
      .leftJoinAndSelect('orderHistory.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'staffUser')
      .leftJoinAndSelect('staff.company', 'staffCompany')
      .leftJoinAndSelect('orderHistory.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItemsProduct.company', 'orderItemsProductCompany')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .leftJoinAndSelect('orderItemsPaintColor.company', 'orderItemsPaintColorCompany')
      .leftJoinAndSelect('orderItems.deliverySchedules', 'orderItemsDeliverySchedules')
      .leftJoinAndSelect('orderItemsDeliverySchedules.assignedStaff', 'deliverySchedulesStaff')
      .leftJoinAndSelect('deliverySchedulesStaff.user', 'deliverySchedulesStaffUser')
      .leftJoinAndSelect('deliverySchedulesStaff.company', 'deliverySchedulesStaffCompany')
      .leftJoinAndSelect('orderHistory.deceased', 'deceased')
      .leftJoinAndSelect('orderHistory.photos', 'photos')
      .leftJoinAndSelect('orderHistory.orderExtraCharges', 'orderExtraCharges')
      .leftJoinAndSelect('orderExtraCharges.serviceExtra', 'orderExtraChargesServiceExtra')
      .leftJoinAndSelect('orderExtraChargesServiceExtra.company', 'orderExtraChargesServiceExtraCompany')
      .leftJoinAndSelect('orderHistory.contacts', 'contacts')
      .leftJoinAndSelect('contacts.customer', 'contactsCustomer')
      .leftJoinAndSelect('contactsCustomer.user', 'contactsCustomerUser')
      .leftJoinAndSelect('contactsCustomer.company', 'contactsCustomerCompany')
      .where('orderHistory.company_id = :companyId', { companyId });

    if (filters?.orderType) {
      queryBuilder.andWhere('orderHistory.order_type = :orderType', {
        orderType: filters.orderType,
      });
    }
    if (filters?.dateFrom) {
      queryBuilder.andWhere('orderHistory.date_of_service >= :dateFrom', {
        dateFrom: filters.dateFrom,
      });
    }
    if (filters?.dateTo) {
      queryBuilder.andWhere('orderHistory.date_of_service <= :dateTo', {
        dateTo: filters.dateTo,
      });
    }

    queryBuilder.orderBy('orderHistory.date_of_service', 'DESC');
    queryBuilder.skip(skip).take(take);

    const [rows, total_data] = await queryBuilder.getManyAndCount();
    const deduplicated = rows.map((r) => deduplicateObjects(r));
    return { total_data, rows: deduplicated };
  }

  /**
   * Get one order history by id and company. Joins child tables via order_history_id.
   */
  public async getHistoryOneById(
    id: string,
    companyId: string
  ): Promise<OrderHistory | undefined> {
    const queryBuilder = this.createQueryBuilder('orderHistory')
      .leftJoinAndSelect('orderHistory.company', 'company')
      .leftJoinAndSelect('orderHistory.location', 'location')
      .leftJoinAndSelect('location.company', 'locationCompany')
      .leftJoinAndSelect('orderHistory.user', 'user')
      .leftJoinAndSelect('user.company', 'userCompany')
      .leftJoinAndSelect('orderHistory.retailer', 'retailer')
      .leftJoinAndSelect('retailer.user', 'retailerUser')
      .leftJoinAndSelect('retailer.company', 'retailerCompany')
      .leftJoinAndSelect('orderHistory.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('customer.company', 'customerCompany')
      .leftJoinAndSelect('orderHistory.director', 'director')
      .leftJoinAndSelect('director.user', 'directorUser')
      .leftJoinAndSelect('director.company', 'directorCompany')
      .leftJoinAndSelect('orderHistory.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'staffUser')
      .leftJoinAndSelect('staff.company', 'staffCompany')
      .leftJoinAndSelect('orderHistory.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItemsProduct.company', 'orderItemsProductCompany')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .leftJoinAndSelect('orderItemsPaintColor.company', 'orderItemsPaintColorCompany')
      .leftJoinAndSelect('orderItems.deliverySchedules', 'orderItemsDeliverySchedules')
      .leftJoinAndSelect('orderItemsDeliverySchedules.assignedStaff', 'deliverySchedulesStaff')
      .leftJoinAndSelect('deliverySchedulesStaff.user', 'deliverySchedulesStaffUser')
      .leftJoinAndSelect('deliverySchedulesStaff.company', 'deliverySchedulesStaffCompany')
      .leftJoinAndSelect('orderHistory.deceased', 'deceased')
      .leftJoinAndSelect('orderHistory.photos', 'photos')
      .leftJoinAndSelect('orderHistory.orderExtraCharges', 'orderExtraCharges')
      .leftJoinAndSelect('orderExtraCharges.serviceExtra', 'orderExtraChargesServiceExtra')
      .leftJoinAndSelect('orderExtraChargesServiceExtra.company', 'orderExtraChargesServiceExtraCompany')
      .leftJoinAndSelect('orderHistory.contacts', 'contacts')
      .leftJoinAndSelect('contacts.customer', 'contactsCustomer')
      .leftJoinAndSelect('contactsCustomer.user', 'contactsCustomerUser')
      .leftJoinAndSelect('contactsCustomer.company', 'contactsCustomerCompany')
      .where('orderHistory.id = :id', { id })
      .andWhere('orderHistory.company_id = :companyId', { companyId });

    const one = await queryBuilder.getOne();
    return one ? deduplicateObjects(one) : undefined;
  }

  /**
   * Get orders grouped by date of service and then by product type. Paginated (skip/take, max 100).
   * Supports order_type filter for tabs.
   */
  public async getOrdersGroupedByDateAndProductType(
    companyId: string,
    orderType?: string,
    pagination?: OrderHistoryPagination
  ): Promise<Array<{ date: string; [key: string]: any }>> {
    const take = Math.min(
      pagination?.take ?? pagination?.limit ?? 50,
      MAX_PAGE_SIZE
    );
    const skip = pagination?.skip ?? (pagination?.page != null ? (pagination.page - 1) * take : 0);

    const queryBuilder = this.createQueryBuilder('orderHistory')
      .leftJoinAndSelect('orderHistory.company', 'company')
      .leftJoinAndSelect('orderHistory.location', 'location')
      .leftJoinAndSelect('orderHistory.user', 'user')
      .leftJoinAndSelect('user.company', 'userCompany')
      .leftJoinAndSelect('orderHistory.retailer', 'retailer')
      .leftJoinAndSelect('retailer.user', 'retailerUser')
      .leftJoinAndSelect('retailer.company', 'retailerCompany')
      .leftJoinAndSelect('orderHistory.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('customer.company', 'customerCompany')
      .leftJoinAndSelect('orderHistory.director', 'director')
      .leftJoinAndSelect('director.user', 'directorUser')
      .leftJoinAndSelect('director.company', 'directorCompany')
      .leftJoinAndSelect('orderHistory.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'staffUser')
      .leftJoinAndSelect('staff.company', 'staffCompany')
      .leftJoinAndSelect('orderHistory.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItemsProduct.company', 'orderItemsProductCompany')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .leftJoinAndSelect('orderItemsPaintColor.company', 'orderItemsPaintColorCompany')
      .leftJoinAndSelect('orderItems.deliverySchedules', 'orderItemsDeliverySchedules')
      .leftJoinAndSelect('orderItemsDeliverySchedules.assignedStaff', 'deliverySchedulesStaff')
      .leftJoinAndSelect('deliverySchedulesStaff.user', 'deliverySchedulesStaffUser')
      .leftJoinAndSelect('deliverySchedulesStaff.company', 'deliverySchedulesStaffCompany')
      .leftJoinAndSelect('orderHistory.deceased', 'deceased')
      .leftJoinAndSelect('orderHistory.photos', 'photos')
      .leftJoinAndSelect('orderHistory.orderExtraCharges', 'orderExtraCharges')
      .leftJoinAndSelect('orderExtraCharges.serviceExtra', 'orderExtraChargesServiceExtra')
      .leftJoinAndSelect('orderExtraChargesServiceExtra.company', 'orderExtraChargesServiceExtraCompany')
      .leftJoinAndSelect('orderHistory.contacts', 'contacts')
      .leftJoinAndSelect('contacts.customer', 'contactsCustomer')
      .leftJoinAndSelect('contactsCustomer.user', 'contactsCustomerUser')
      .leftJoinAndSelect('contactsCustomer.company', 'contactsCustomerCompany')
      .where('orderHistory.company_id = :companyId', { companyId });

    if (orderType) {
      queryBuilder.andWhere('orderHistory.order_type = :orderType', { orderType });
    }

    queryBuilder
      .orderBy('orderHistory.dateOfService', 'ASC')
      .skip(skip)
      .take(take);
    const orders = await queryBuilder.getMany();

    const keyMap: Record<string, string> = {
      vault: 'vaults',
      casket: 'caskets',
      urn: 'urns',
      grave_digging: 'grave_diggings',
      cremation: 'cremations',
      monument: 'monuments',
      bulk_precast: 'bulk_precasts',
    };

    const grouped: Record<string, Record<string, OrderHistory[]>> = {};

    orders.forEach((order) => {
      if (!order.dateOfService) return;
      const dateKey =
        order.dateOfService instanceof Date
          ? order.dateOfService.toISOString().split('T')[0]
          : new Date(order.dateOfService).toISOString().split('T')[0];
      if (!grouped[dateKey]) {
        grouped[dateKey] = {
          vaults: [],
          caskets: [],
          urns: [],
          grave_diggings: [],
          cremations: [],
          monuments: [],
          bulk_precasts: [],
        };
      }
      if (order.orderItems && order.orderItems.length > 0) {
        const productTypesInOrder: Record<string, boolean> = {};
        order.orderItems.forEach((item: any) => {
          if (item.productType) {
            const typeKey = String(item.productType).toLowerCase();
            const mappedKey = keyMap[typeKey] ?? typeKey;
            if (grouped[dateKey][mappedKey]) {
              productTypesInOrder[mappedKey] = true;
            }
          }
        });
        Object.keys(productTypesInOrder).forEach((mappedKey) => {
          const orderCopy = { ...order };
          orderCopy.orderItems = order.orderItems!.filter((oi: any) => {
            if (!oi.productType) return false;
            const oiTypeKey = String(oi.productType).toLowerCase();
            const oiMappedKey = keyMap[oiTypeKey] ?? oiTypeKey;
            return oiMappedKey === mappedKey;
          });
          if (orderCopy.orderItems.length > 0) {
            grouped[dateKey][mappedKey].push(deduplicateObjects(orderCopy));
          }
        });
      } else if (order.orderType) {
        // No orderItems (e.g. join not loaded or archived order): use top-level orderType
        const typeKey = String(order.orderType).toLowerCase();
        const mappedKey = keyMap[typeKey];
        if (mappedKey && grouped[dateKey][mappedKey]) {
          grouped[dateKey][mappedKey].push(deduplicateObjects(order));
        }
      }
    });

    const result = Object.keys(grouped)
      .sort()
      .map((dateKey) => {
        const dateGroup = grouped[dateKey];
        if (orderType) {
          const typeKey = orderType.toLowerCase();
          const mappedKey = keyMap[typeKey] ?? typeKey;
          return {
            date: dateKey,
            [mappedKey]: dateGroup[mappedKey] ?? [],
          };
        }
        return { date: dateKey, ...dateGroup };
      });

    return result;
  }
}
