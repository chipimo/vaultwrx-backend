import { Repository, SelectQueryBuilder, In, Not, IsNull } from 'typeorm';
import { Service } from 'typedi';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { OrderItem, ProductType } from '@base/api/models/Sales-and-orders/OrderItem';

export interface OrderItemFilters {
  orderId?: string;
  productType?: ProductType[];
  productId?: string;
  hasEngraving?: boolean;
  hasCustomization?: boolean;
  deliverByFrom?: Date;
  deliverByTo?: Date;
  search?: string;
}

export interface OrderItemListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeOrder?: boolean;
  includeProduct?: boolean;
}

@Service()
export class OrderItemRepository extends RepositoryBase<OrderItem> {
  constructor() {
    super();
  }

  /**
   * Get order items with advanced filtering and pagination
   */
  public async getOrderItemsWithFilters(
    filters: OrderItemFilters = {},
    options: OrderItemListOptions = {}
  ): Promise<{ orderItems: OrderItem[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeOrder = false,
      includeProduct = false
    } = options;

    const queryBuilder = this.createQueryBuilder('orderItem');

    // Apply filters
    this.applyFilters(queryBuilder, filters);

    // Apply includes
    if (includeOrder) {
      queryBuilder.leftJoinAndSelect('orderItem.order', 'order');
    }

    if (includeProduct) {
      queryBuilder.leftJoinAndSelect('orderItem.product', 'product');
    }

    // Apply sorting
    queryBuilder.orderBy(`orderItem.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    return {
      orderItems,
      total,
      page,
      limit
    };
  }

  /**
   * Get order items by order ID
   */
  public async getOrderItemsByOrderId(
    orderId: string,
    includeProduct: boolean = false
  ): Promise<OrderItem[]> {
    const queryBuilder = this.createQueryBuilder('orderItem')
      .where('orderItem.orderId = :orderId', { orderId });

    if (includeProduct) {
      queryBuilder.leftJoinAndSelect('orderItem.product', 'product');
    }

    return await queryBuilder.getMany();
  }

  /**
   * Get order items by product type
   */
  public async getOrderItemsByProductType(
    productType: ProductType,
    options: OrderItemListOptions = {}
  ): Promise<{ orderItems: OrderItem[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('orderItem')
      .where('orderItem.productType = :productType', { productType })
      .leftJoinAndSelect('orderItem.order', 'order')
      .orderBy(`orderItem.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    return { orderItems, total };
  }

  /**
   * Get order items by product ID
   */
  public async getOrderItemsByProductId(
    productId: string,
    options: OrderItemListOptions = {}
  ): Promise<{ orderItems: OrderItem[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('orderItem')
      .where('orderItem.productId = :productId', { productId })
      .leftJoinAndSelect('orderItem.order', 'order')
      .orderBy(`orderItem.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    return { orderItems, total };
  }

  /**
   * Get order items with engraving
   */
  public async getOrderItemsWithEngraving(
    options: OrderItemListOptions = {}
  ): Promise<{ orderItems: OrderItem[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('orderItem')
      .where('orderItem.engraving IS NOT NULL')
      .andWhere('orderItem.engraving != :empty', { empty: '' })
      .leftJoinAndSelect('orderItem.order', 'order')
      .orderBy(`orderItem.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    return { orderItems, total };
  }

  /**
   * Get order items with customization
   */
  public async getOrderItemsWithCustomization(
    options: OrderItemListOptions = {}
  ): Promise<{ orderItems: OrderItem[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('orderItem')
      .where('orderItem.customization IS NOT NULL')
      .andWhere('orderItem.customization != :empty', { empty: '' })
      .leftJoinAndSelect('orderItem.order', 'order')
      .orderBy(`orderItem.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    return { orderItems, total };
  }

  /**
   * Get order items by delivery date range
   */
  public async getOrderItemsByDeliveryDateRange(
    startDate: Date,
    endDate: Date,
    options: OrderItemListOptions = {}
  ): Promise<{ orderItems: OrderItem[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'deliverBy', sortOrder = 'ASC' } = options;

    const queryBuilder = this.createQueryBuilder('orderItem')
      .where('orderItem.deliverBy BETWEEN :startDate AND :endDate', { startDate, endDate })
      .leftJoinAndSelect('orderItem.order', 'order')
      .orderBy(`orderItem.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    return { orderItems, total };
  }

  /**
   * Get order item statistics
   */
  public async getOrderItemStatistics(): Promise<{
    totalItems: number;
    itemsByProductType: Record<ProductType, number>;
    itemsWithEngraving: number;
    itemsWithCustomization: number;
    averageItemValue: number;
    totalItemValue: number;
  }> {
    // Total items
    const totalItems = await this.count();

    // Items by product type
    const typeStats = await this.createQueryBuilder('orderItem')
      .select('orderItem.productType', 'productType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('orderItem.productType')
      .getRawMany();

    const itemsByProductType = typeStats.reduce((acc, stat) => {
      acc[stat.productType] = parseInt(stat.count);
      return acc;
    }, {} as Record<ProductType, number>);

    // Items with engraving
    const itemsWithEngraving = await this.count({
      where: {
        engraving: Not(IsNull())
      }
    });

    // Items with customization
    const itemsWithCustomization = await this.count({
      where: {
        customization: Not(IsNull())
      }
    });

    // Value statistics
    const valueStats = await this.createQueryBuilder('orderItem')
      .select('SUM(orderItem.totalPrice)', 'totalItemValue')
      .addSelect('AVG(orderItem.totalPrice)', 'averageItemValue')
      .getRawOne();

    return {
      totalItems,
      itemsByProductType,
      itemsWithEngraving,
      itemsWithCustomization,
      averageItemValue: parseFloat(valueStats.averageItemValue) || 0,
      totalItemValue: parseFloat(valueStats.totalItemValue) || 0
    };
  }

  /**
   * Search order items
   */
  public async searchOrderItems(
    searchTerm: string,
    options: OrderItemListOptions = {}
  ): Promise<{ orderItems: OrderItem[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('orderItem')
      .leftJoin('orderItem.order', 'order')
      .where(
        '(orderItem.id ILIKE :search OR orderItem.customization ILIKE :search OR orderItem.engraving ILIKE :search OR orderItem.theme ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .leftJoinAndSelect('orderItem.order', 'order')
      .orderBy(`orderItem.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orderItems, total] = await queryBuilder.getManyAndCount();

    return { orderItems, total };
  }

  /**
   * Apply filters to query builder
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<OrderItem>, filters: OrderItemFilters): void {
    if (filters.orderId) {
      queryBuilder.andWhere('orderItem.orderId = :orderId', { orderId: filters.orderId });
    }

    if (filters.productType && filters.productType.length > 0) {
      queryBuilder.andWhere('orderItem.productType IN (:...productType)', { productType: filters.productType });
    }

    if (filters.productId) {
      queryBuilder.andWhere('orderItem.productId = :productId', { productId: filters.productId });
    }

    if (filters.hasEngraving !== undefined) {
      if (filters.hasEngraving) {
        queryBuilder.andWhere('orderItem.engraving IS NOT NULL')
          .andWhere('orderItem.engraving != :empty', { empty: '' });
      } else {
        queryBuilder.andWhere('(orderItem.engraving IS NULL OR orderItem.engraving = :empty)', { empty: '' });
      }
    }

    if (filters.hasCustomization !== undefined) {
      if (filters.hasCustomization) {
        queryBuilder.andWhere('orderItem.customization IS NOT NULL')
          .andWhere('orderItem.customization != :empty', { empty: '' });
      } else {
        queryBuilder.andWhere('(orderItem.customization IS NULL OR orderItem.customization = :empty)', { empty: '' });
      }
    }

    if (filters.deliverByFrom) {
      queryBuilder.andWhere('orderItem.deliverBy >= :deliverByFrom', { deliverByFrom: filters.deliverByFrom });
    }

    if (filters.deliverByTo) {
      queryBuilder.andWhere('orderItem.deliverBy <= :deliverByTo', { deliverByTo: filters.deliverByTo });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(orderItem.id ILIKE :search OR orderItem.customization ILIKE :search OR orderItem.engraving ILIKE :search OR orderItem.theme ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }
}
