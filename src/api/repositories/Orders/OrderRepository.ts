import { Order } from '@api/models/Orders/Order';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Customer } from '@api/models/Users/Customer';
import { Retailer } from '@api/models/Users/Retailer';
import { Staff } from '@api/models/Users/Staff';
import { FuneralDirector } from '@api/models/Users/FuneralDirector';
import { User } from '@api/models/Users/User';
import { Location } from '@api/models/Products/Location';
import { Company } from '@api/models/Company/Company';
import { OrderItem } from '@api/models/Orders/OrderItem';
import { deduplicateObjects } from '@base/infrastructure/utils/deduplicateObjects';
import { ProductType } from '@api/models/Products/Product';

@EntityRepository(Order)
export class OrderRepository extends RepositoryBase<Order> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.company', 'company')
      .leftJoinAndSelect('order.location', 'location')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.company', 'userCompany')
      .leftJoinAndSelect('order.retailer', 'retailer')
      .leftJoinAndSelect('retailer.user', 'retailerUser')
      .leftJoinAndSelect('retailer.company', 'retailerCompany')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('customer.company', 'customerCompany')
      .leftJoinAndSelect('order.director', 'director')
      .leftJoinAndSelect('director.user', 'directorUser')
      .leftJoinAndSelect('director.company', 'directorCompany')
      .leftJoinAndSelect('order.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'staffUser')
      .leftJoinAndSelect('staff.company', 'staffCompany')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItemsProduct.company', 'orderItemsProductCompany')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .leftJoinAndSelect('orderItemsPaintColor.company', 'orderItemsPaintColorCompany')
      .leftJoinAndSelect('orderItems.deliverySchedules', 'orderItemsDeliverySchedules')
      .leftJoinAndSelect('orderItemsDeliverySchedules.assignedStaff', 'deliverySchedulesStaff')
      .leftJoinAndSelect('deliverySchedulesStaff.user', 'deliverySchedulesStaffUser')
      .leftJoinAndSelect('deliverySchedulesStaff.company', 'deliverySchedulesStaffCompany')
      .leftJoinAndSelect('order.deceased', 'deceased')
      .leftJoinAndSelect('order.photos', 'photos')
      .leftJoinAndSelect('order.orderExtraCharges', 'orderExtraCharges')
      .leftJoinAndSelect('orderExtraCharges.serviceExtra', 'orderExtraChargesServiceExtra')
      .leftJoinAndSelect('orderExtraChargesServiceExtra.company', 'orderExtraChargesServiceExtraCompany')
      .leftJoinAndSelect('order.contacts', 'contacts')
      .leftJoinAndSelect('contacts.customer', 'contactsCustomer')
      .leftJoinAndSelect('contactsCustomer.user', 'contactsCustomerUser')
      .leftJoinAndSelect('contactsCustomer.company', 'contactsCustomerCompany');

    if (companyId) {
      queryBuilder.where('order.company_id = :companyId', { companyId });
    }

    if (resourceOptions) {
      const { filters, sorts, pagination } = resourceOptions;
      
      if (filters) {
        Object.keys(filters).forEach((key) => {
          if (key === 'productType') {
            queryBuilder.andWhere('orderItems.productType = :productType', { productType: filters[key] });
          } else {
            queryBuilder.andWhere(`order.${key} = :${key}`, { [key]: filters[key] });
          }
        });
      }
      
      if (sorts) {
        sorts.forEach((sort: any) => {
          queryBuilder.addOrderBy(`order.${sort.field}`, sort.order);
        });
      }
      
      if (pagination) {
        queryBuilder.skip(pagination.skip).take(pagination.take);
      }
    }

    const [items, count] = await queryBuilder.getManyAndCount();
    
    const deduplicatedItems = items.map(item => deduplicateObjects(item));
    
    return {
      total_data: count,
      rows: deduplicatedItems,
    };
  }

  public async getOneById(id: string, resourceOptions?: any, companyId?: string) {
    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.company', 'company')
      .leftJoinAndSelect('order.location', 'location')
      .leftJoinAndSelect('location.company', 'locationCompany')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.user', 'userUser')
      .leftJoinAndSelect('user.company', 'userCompany')
      .leftJoinAndSelect('order.retailer', 'retailer')
      .leftJoinAndSelect('retailer.user', 'retailerUser')
      .leftJoinAndSelect('retailer.company', 'retailerCompany')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('customer.company', 'customerCompany')
      .leftJoinAndSelect('order.director', 'director')
      .leftJoinAndSelect('director.user', 'directorUser')
      .leftJoinAndSelect('director.company', 'directorCompany')
      .leftJoinAndSelect('order.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'staffUser')
      .leftJoinAndSelect('staff.company', 'staffCompany')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItemsProduct.company', 'orderItemsProductCompany')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .leftJoinAndSelect('orderItemsPaintColor.company', 'orderItemsPaintColorCompany')
      .leftJoinAndSelect('orderItems.deliverySchedules', 'orderItemsDeliverySchedules')
      .leftJoinAndSelect('orderItemsDeliverySchedules.assignedStaff', 'deliverySchedulesStaff')
      .leftJoinAndSelect('deliverySchedulesStaff.user', 'deliverySchedulesStaffUser')
      .leftJoinAndSelect('deliverySchedulesStaff.company', 'deliverySchedulesStaffCompany')
      .leftJoinAndSelect('order.deceased', 'deceased')
      .leftJoinAndSelect('order.photos', 'photos')
      .leftJoinAndSelect('order.orderExtraCharges', 'orderExtraCharges')
      .leftJoinAndSelect('orderExtraCharges.serviceExtra', 'orderExtraChargesServiceExtra')
      .leftJoinAndSelect('orderExtraChargesServiceExtra.company', 'orderExtraChargesServiceExtraCompany')
      .leftJoinAndSelect('order.contacts', 'contacts')
      .leftJoinAndSelect('contacts.customer', 'contactsCustomer')
      .leftJoinAndSelect('contactsCustomer.user', 'contactsCustomerUser')
      .leftJoinAndSelect('contactsCustomer.company', 'contactsCustomerCompany')
      .where('order.id = :id', { id });

    if (companyId) {
      queryBuilder.andWhere('order.company_id = :companyId', { companyId });
    }

    if (resourceOptions?.relations) {
      resourceOptions.relations.forEach((relation: string) => {
        const existingJoin = queryBuilder.expressionMap.joinAttributes.find(
          ja => ja.alias.name === relation || ja.alias.name === `order.${relation}`
        );
        if (!existingJoin) {
          queryBuilder.leftJoinAndSelect(`order.${relation}`, relation);
        }
      });
    }

    const order = await queryBuilder.getOne();
    
    return order ? deduplicateObjects(order) : undefined;
  }

  public async createOrder(data: object, companyId?: string, user?: any) {
    let entity = new Order();

    Object.assign(entity, data);

    // Set userId to the logged-in user who is creating/placing the order
    if (user && user.id) {
      entity.userId = user.id;
    }

    if (companyId) {
      entity.companyId = companyId;

      if (entity.customerId) {
        const customer = await this.manager.findOne(Customer, {
          where: { id: entity.customerId },
        });
        if (!customer) {
          throw new Error('Customer not found');
        }
        if (customer.company_id !== companyId) {
          throw new Error('Customer does not belong to the specified company');
        }
      }

      if (entity.retailerId) {
        const company = await this.manager.findOne(Company, {
          where: { id: companyId },
        });
        if (!company) {
          throw new Error('Company not found');
        }
        if (company.retailer_id !== entity.retailerId) {
          throw new Error('Retailer does not belong to the specified company');
        }
      }

      if (entity.staffId) {
        const staff = await this.manager.findOne(Staff, {
          where: { id: entity.staffId },
        });
        if (!staff) {
          throw new Error('Staff not found');
        }
        if (staff.company_id !== companyId) {
          throw new Error('Staff does not belong to the specified company');
        }
      }

      if (entity.directorId) {
        const director = await this.manager.findOne(FuneralDirector, {
          where: { id: entity.directorId },
        });
        if (!director) {
          // If directorId is provided but not found, set it to null instead of throwing error
          // This allows orders to be created without a director if the ID is invalid
          entity.directorId = null;
        } else if (director.company_id !== companyId) {
          throw new Error('Funeral director does not belong to the specified company');
        }
      }

      if (entity.locationId) {
        const location = await this.manager.findOne(Location, {
          where: { id: entity.locationId },
        });
        if (!location) {
          throw new Error('Location not found');
        }
        if (location.companyId !== companyId) {
          throw new Error('Location does not belong to the specified company');
        }
      }

      if (entity.userId) {
        const user = await this.manager.findOne(User, {
          where: { id: entity.userId },
        });
        if (!user) {
          throw new Error('User not found');
        }
        // User company validation is optional - users may belong to different companies
        // or may not have a company_id set (e.g., admins, retailers)
      }
    }

    // Extract orderItems from data before saving (they're not part of Order entity)
    const orderItemsData = (data as any).orderItems || [];
    delete (entity as any).orderItems; // Remove orderItems from entity to avoid saving them directly

    // Save the order first
    const savedOrder = await this.save(entity);

    // Create order items if provided
    if (orderItemsData && orderItemsData.length > 0) {
      const orderItemRepository = this.manager.getRepository(OrderItem);
      
      for (const itemData of orderItemsData) {
        const orderItem = new OrderItem();
        orderItem.orderId = savedOrder.id;
        
        // productId must be a valid UUID
        if (itemData.productId) {
          const productIdStr = String(itemData.productId);
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(productIdStr)) {
            orderItem.productId = productIdStr;
          } else {
            // If it's not a valid UUID, set to null
            orderItem.productId = null;
          }
        } else {
          orderItem.productId = null;
        }
        orderItem.productType = itemData.productType || null;
        orderItem.quantity = itemData.quantity || 1;
        orderItem.unitPrice = itemData.unitPrice || null;
        orderItem.totalPrice = itemData.totalPrice || null;
        orderItem.customization = itemData.customization || null;
        orderItem.engraving = itemData.engraving || null;
        orderItem.engravingPosition = itemData.engravingPosition || null;
        orderItem.engravingFont = itemData.engravingFont || null;
        orderItem.engravingColor = itemData.engravingColor || null;
        orderItem.theme = itemData.theme || null;
        // paintColorId must be a valid UUID, not a number
        if (itemData.paintColorId) {
          const paintColorIdStr = String(itemData.paintColorId);
          // Check if it's a valid UUID format (basic check)
          const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
          if (uuidRegex.test(paintColorIdStr)) {
            orderItem.paintColorId = paintColorIdStr;
          } else {
            // If it's not a valid UUID (e.g., just a number), set to null
            orderItem.paintColorId = null;
          }
        } else {
          orderItem.paintColorId = null;
        }
        orderItem.deliverBy = itemData.deliverBy ? new Date(itemData.deliverBy) : null;
        orderItem.deliveryTime = itemData.deliveryTime || null;
        orderItem.deliveryLocation = itemData.deliveryLocation || null;
        orderItem.comments = itemData.comments || null;
        orderItem.height = itemData.height || null;
        orderItem.weight = itemData.weight || null;
        orderItem.gender = itemData.gender || null;
        orderItem.isEmbalmed = itemData.isEmbalmed || null;
        orderItem.bodyContainer = itemData.bodyContainer || null;
        orderItem.cremationType = itemData.cremationType || null;
        orderItem.witnessesPresent = itemData.witnessesPresent || null;
        orderItem.witnessType = itemData.witnessType || null;
        orderItem.cremainsContainer = itemData.cremainsContainer || null;
        orderItem.lastDayLettering = itemData.lastDayLettering || null;
        orderItem.monumentInPlace = itemData.monumentInPlace || null;
        orderItem.nameOnStone = itemData.nameOnStone || null;
        orderItem.graveType = itemData.graveType || null;
        orderItem.graveOpeningClosing = itemData.graveOpeningClosing || null;
        orderItem.graveOpeningOnly = itemData.graveOpeningOnly || null;
        orderItem.graveClosingOnly = itemData.graveClosingOnly || null;
        orderItem.cemetery = itemData.cemetery || null;
        orderItem.section = itemData.section || null;
        orderItem.graveSpace = itemData.graveSpace || null;
        orderItem.serviceTime = itemData.serviceTime || null;
        orderItem.serviceDate = itemData.serviceDate ? new Date(itemData.serviceDate) : null;
        orderItem.requestedCompletionDate = itemData.requestedCompletionDate ? new Date(itemData.requestedCompletionDate) : null;

        await orderItemRepository.save(orderItem);
      }
    }

    // Reload the order with orderItems
    const orderWithItems = await this.createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .where('order.id = :id', { id: savedOrder.id })
      .getOne();
    
    return orderWithItems || savedOrder;
  }

  public async updateOrder(order: Order, data: object, companyId?: string) {
    if (companyId) {
      const updateData = data as any;

      if (updateData.customerId && updateData.customerId !== order.customerId) {
        const customer = await this.manager.findOne(Customer, {
          where: { id: updateData.customerId },
        });
        if (!customer) {
          throw new Error('Customer not found');
        }
        if (customer.company_id !== companyId) {
          throw new Error('Customer does not belong to the specified company');
        }
      }

      if (updateData.staffId && updateData.staffId !== order.staffId) {
        const staff = await this.manager.findOne(Staff, {
          where: { id: updateData.staffId },
        });
        if (!staff) {
          throw new Error('Staff not found');
        }
        if (staff.company_id !== companyId) {
          throw new Error('Staff does not belong to the specified company');
        }
      }

      if (updateData.directorId && updateData.directorId !== order.directorId) {
        const director = await this.manager.findOne(FuneralDirector, {
          where: { id: updateData.directorId },
        });
        if (!director) {
          throw new Error('Funeral director not found');
        }
        if (director.company_id !== companyId) {
          throw new Error('Funeral director does not belong to the specified company');
        }
      }

      if (updateData.locationId && updateData.locationId !== order.locationId) {
        const location = await this.manager.findOne(Location, {
          where: { id: updateData.locationId },
        });
        if (!location) {
          throw new Error('Location not found');
        }
        if (location.companyId !== companyId) {
          throw new Error('Location does not belong to the specified company');
        }
      }
    }

    Object.assign(order, data);

    return await this.save(order);
  }

  /**
   * Get orders filtered by product type
   * Returns orders that have at least one order item of the specified product type
   * Each order will only include order items of the specified product type
   */
  public async getManyAndCountByProductType(
    productType: ProductType,
    resourceOptions?: any,
    companyId?: string
  ) {
    const subQuery = this.createQueryBuilder('order')
      .innerJoin('order.orderItems', 'orderItems')
      .where('orderItems.productType = :productType', { productType })
      .andWhere('order.is_deleted = :isDeleted', { isDeleted: false });

    if (companyId) {
      subQuery.andWhere('order.company_id = :companyId', { companyId });
    }

    const orderIds = await subQuery.select('order.id', 'id').getRawMany();
    const orderIdList = orderIds.map((o: any) => o.id);

    if (orderIdList.length === 0) {
      return {
        total_data: 0,
        rows: [],
      };
    }

    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.company', 'company')
      .leftJoinAndSelect('order.location', 'location')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.company', 'userCompany')
      .leftJoinAndSelect('order.retailer', 'retailer')
      .leftJoinAndSelect('retailer.user', 'retailerUser')
      .leftJoinAndSelect('retailer.company', 'retailerCompany')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('customer.company', 'customerCompany')
      .leftJoinAndSelect('order.director', 'director')
      .leftJoinAndSelect('director.user', 'directorUser')
      .leftJoinAndSelect('director.company', 'directorCompany')
      .leftJoinAndSelect('order.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'staffUser')
      .leftJoinAndSelect('staff.company', 'staffCompany')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItemsProduct.company', 'orderItemsProductCompany')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .leftJoinAndSelect('orderItemsPaintColor.company', 'orderItemsPaintColorCompany')
      .leftJoinAndSelect('orderItems.deliverySchedules', 'orderItemsDeliverySchedules')
      .leftJoinAndSelect('orderItemsDeliverySchedules.assignedStaff', 'deliverySchedulesStaff')
      .leftJoinAndSelect('deliverySchedulesStaff.user', 'deliverySchedulesStaffUser')
      .leftJoinAndSelect('deliverySchedulesStaff.company', 'deliverySchedulesStaffCompany')
      .leftJoinAndSelect('order.deceased', 'deceased')
      .leftJoinAndSelect('order.photos', 'photos')
      .leftJoinAndSelect('order.orderExtraCharges', 'orderExtraCharges')
      .leftJoinAndSelect('orderExtraCharges.serviceExtra', 'orderExtraChargesServiceExtra')
      .leftJoinAndSelect('orderExtraChargesServiceExtra.company', 'orderExtraChargesServiceExtraCompany')
      .leftJoinAndSelect('order.contacts', 'contacts')
      .leftJoinAndSelect('contacts.customer', 'contactsCustomer')
      .leftJoinAndSelect('contactsCustomer.user', 'contactsCustomerUser')
      .leftJoinAndSelect('contactsCustomer.company', 'contactsCustomerCompany')
      .where('order.id IN (:...orderIds)', { orderIds: orderIdList })
      .andWhere('order.is_deleted = :isDeleted', { isDeleted: false });

    if (companyId) {
      queryBuilder.andWhere('order.company_id = :companyId', { companyId });
    }

    if (resourceOptions) {
      const { filters, sorts, pagination } = resourceOptions;
      
      if (filters) {
        Object.keys(filters).forEach((key) => {
          if (key !== 'productType') {
            queryBuilder.andWhere(`order.${key} = :${key}`, { [key]: filters[key] });
          }
        });
      }
      
      if (sorts) {
        sorts.forEach((sort: any) => {
          queryBuilder.addOrderBy(`order.${sort.field}`, sort.order);
        });
      }
      
      if (pagination) {
        queryBuilder.skip(pagination.skip).take(pagination.take);
      }
    }

    const [items, count] = await queryBuilder.getManyAndCount();
    
    const filteredItems = items.map(order => {
      const filteredOrder = { ...order };
      if (filteredOrder.orderItems) {
        filteredOrder.orderItems = filteredOrder.orderItems.filter(
          (item: any) => item.productType === productType
        );
      }
      return deduplicateObjects(filteredOrder);
    });
    
    return {
      total_data: count,
      rows: filteredItems,
    };
  }

  /**
   * Get orders grouped by date of service and then by product type
   * Returns an array of date groups, each containing product type groups
   * Structure: [{ "date": "YYYY-MM-DD", "vaults": [...], "caskets": [...], ... }, ...]
   * If productType is provided, only returns orders with that product type and only that type in the response
   */
  public async getOrdersGroupedByDateAndProductType(
    companyId?: string,
    resourceOptions?: any,
    productType?: ProductType | 'all'
  ) {
    const queryBuilder = this.createQueryBuilder('order')
      .leftJoinAndSelect('order.company', 'company')
      .leftJoinAndSelect('order.location', 'location')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('user.company', 'userCompany')
      .leftJoinAndSelect('order.retailer', 'retailer')
      .leftJoinAndSelect('retailer.user', 'retailerUser')
      .leftJoinAndSelect('retailer.company', 'retailerCompany')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('customer.user', 'customerUser')
      .leftJoinAndSelect('customer.company', 'customerCompany')
      .leftJoinAndSelect('order.director', 'director')
      .leftJoinAndSelect('director.user', 'directorUser')
      .leftJoinAndSelect('director.company', 'directorCompany')
      .leftJoinAndSelect('order.staff', 'staff')
      .leftJoinAndSelect('staff.user', 'staffUser')
      .leftJoinAndSelect('staff.company', 'staffCompany')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.product', 'orderItemsProduct')
      .leftJoinAndSelect('orderItemsProduct.company', 'orderItemsProductCompany')
      .leftJoinAndSelect('orderItems.paintColor', 'orderItemsPaintColor')
      .leftJoinAndSelect('orderItemsPaintColor.company', 'orderItemsPaintColorCompany')
      .leftJoinAndSelect('orderItems.deliverySchedules', 'orderItemsDeliverySchedules')
      .leftJoinAndSelect('orderItemsDeliverySchedules.assignedStaff', 'deliverySchedulesStaff')
      .leftJoinAndSelect('deliverySchedulesStaff.user', 'deliverySchedulesStaffUser')
      .leftJoinAndSelect('deliverySchedulesStaff.company', 'deliverySchedulesStaffCompany')
      .leftJoinAndSelect('order.deceased', 'deceased')
      .leftJoinAndSelect('order.photos', 'photos')
      .leftJoinAndSelect('order.orderExtraCharges', 'orderExtraCharges')
      .leftJoinAndSelect('orderExtraCharges.serviceExtra', 'orderExtraChargesServiceExtra')
      .leftJoinAndSelect('orderExtraChargesServiceExtra.company', 'orderExtraChargesServiceExtraCompany')
      .leftJoinAndSelect('order.contacts', 'contacts')
      .leftJoinAndSelect('contacts.customer', 'contactsCustomer')
      .leftJoinAndSelect('contactsCustomer.user', 'contactsCustomerUser')
      .leftJoinAndSelect('contactsCustomer.company', 'contactsCustomerCompany')
      .where('order.is_deleted = :isDeleted', { isDeleted: false })
      .andWhere('order.date_of_service IS NOT NULL');

    if (companyId) {
      queryBuilder.andWhere('order.company_id = :companyId', { companyId });
    }

    // Filter by product type if specified (and not 'all')
    if (productType && productType !== 'all') {
      // Use subquery to find orders that have items of the specified product type
      const subQuery = this.createQueryBuilder('order')
        .innerJoin('order.orderItems', 'orderItems')
        .where('orderItems.productType = :productType', { productType })
        .andWhere('order.is_deleted = :isDeleted', { isDeleted: false })
        .andWhere('order.date_of_service IS NOT NULL');
      
      if (companyId) {
        subQuery.andWhere('order.company_id = :companyId', { companyId });
      }
      
      const orderIds = await subQuery.select('order.id', 'id').getRawMany();
      const orderIdList = orderIds.map((o: any) => o.id);
      
      if (orderIdList.length === 0) {
        return [];
      }
      
      queryBuilder.andWhere('order.id IN (:...orderIds)', { orderIds: orderIdList });
    }

    if (resourceOptions?.filters) {
      const { filters } = resourceOptions;
      Object.keys(filters).forEach((key) => {
        if (key !== 'dateOfService' && key !== 'productType') {
          queryBuilder.andWhere(`order.${key} = :${key}`, { [key]: filters[key] });
        }
      });
    }

    queryBuilder.orderBy('order.date_of_service', 'ASC');

    const orders = await queryBuilder.getMany();

    const grouped: Record<string, Record<string, Order[]>> = {};

    orders.forEach((order) => {
      if (!order.dateOfService) {
        return; 
      }

      const dateKey = order.dateOfService instanceof Date
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
        const keyMap: Record<string, string> = {
          vault: 'vaults',
          casket: 'caskets',
          urn: 'urns',
          grave_digging: 'grave_diggings',
          cremation: 'cremations',
          monument: 'monuments',
          bulk_precast: 'bulk_precasts',
        };

        const productTypesInOrder: Record<string, boolean> = {};

        order.orderItems.forEach((item: any) => {
          if (item.productType) {
            const typeKey = item.productType.toLowerCase();
            const mappedKey = keyMap[typeKey] || typeKey;
            if (grouped[dateKey][mappedKey]) {
              productTypesInOrder[mappedKey] = true;
            }
          }
        });

        Object.keys(productTypesInOrder).forEach((mappedKey) => {
          const orderCopy = { ...order };
          orderCopy.orderItems = order.orderItems.filter(
            (oi: any) => {
              if (!oi.productType) return false;
              const oiTypeKey = oi.productType.toLowerCase();
              const oiMappedKey = keyMap[oiTypeKey] || oiTypeKey;
              return oiMappedKey === mappedKey;
            }
          );
          if (orderCopy.orderItems.length > 0) {
            grouped[dateKey][mappedKey].push(deduplicateObjects(orderCopy));
          }
        });
      }
    });

    // Map product type enum to response key
    const keyMap: Record<string, string> = {
      vault: 'vaults',
      casket: 'caskets',
      urn: 'urns',
      grave_digging: 'grave_diggings',
      cremation: 'cremations',
      monument: 'monuments',
      bulk_precast: 'bulk_precasts',
    };

    const result = Object.keys(grouped)
      .sort() 
      .map((dateKey) => {
        const dateGroup = grouped[dateKey];
        
        // If a specific product type is requested, only return that type
        if (productType && productType !== 'all') {
          const typeKey = productType.toLowerCase();
          const mappedKey = keyMap[typeKey] || typeKey;
          
          return {
            date: dateKey,
            [mappedKey]: dateGroup[mappedKey] || [],
          };
        }
        
        // Otherwise return all product types
        return {
          date: dateKey,
          ...dateGroup,
        };
      });

    return result;
  }
}

