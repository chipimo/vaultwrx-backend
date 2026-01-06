import { Repository, SelectQueryBuilder, In, MoreThanOrEqual } from 'typeorm';
import { Service } from 'typedi';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Order, OrderStatus } from '@base/api/models/Sales-and-orders/Order';

export interface OrderFilters {
  status?: OrderStatus[];
  customerId?: string;
  retailerId?: string;
  directorId?: string;
  staffId?: string;
  cemetery?: string;
  dateFrom?: Date;
  dateTo?: Date;
  search?: string;
}

export interface OrderListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeItems?: boolean;
  includeCustomer?: boolean;
  includeDeceased?: boolean;
  includePhotos?: boolean;
  includeExtraCharges?: boolean;
}

@Service()
export class OrderRepository extends RepositoryBase<Order> {
  constructor() {
    super();
  }

  /**
   * Get orders with advanced filtering and pagination
   */
  public async getOrdersWithFilters(
    filters: OrderFilters = {},
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeItems = false,
      includeCustomer = true,
      includeDeceased = false,
      includePhotos = false,
      includeExtraCharges = false
    } = options;

    const queryBuilder = this.createQueryBuilder('order');

    // Apply filters
    this.applyFilters(queryBuilder, filters);

    // Apply includes
    if (includeCustomer) {
      queryBuilder.leftJoinAndSelect('order.customer', 'customer');
    }

    if (includeDeceased) {
      queryBuilder.leftJoinAndSelect('order.deceased', 'deceased');
    }

    if (includeItems) {
      queryBuilder.leftJoinAndSelect('order.orderItems', 'orderItems');
    }

    if (includePhotos) {
      queryBuilder.leftJoinAndSelect('order.photos', 'photos');
    }

    if (includeExtraCharges) {
      queryBuilder.leftJoinAndSelect('order.orderExtraCharges', 'orderExtraCharges');
    }

    // Apply sorting
    queryBuilder.orderBy(`order.${sortBy}`, sortOrder);

    // Apply pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      orders,
      total,
      page,
      limit
    };
  }

  /**
   * Get order by ID with relations
   */
  public async getOrderById(
    id: string,
    retailerId: string,
    includeItems: boolean = true,
    includeCustomer: boolean = true,
    includeDeceased: boolean = true,
    includePhotos: boolean = false,
    includeExtraCharges: boolean = false
  ): Promise<Order | null> {
    const queryBuilder = this.createQueryBuilder('order')
      .where('order.id = :id', { id })
      .andWhere('order.retailerId = :retailerId', { retailerId });

    if (includeCustomer) {
      queryBuilder.leftJoinAndSelect('order.customer', 'customer');
    }

    if (includeDeceased) {
      queryBuilder.leftJoinAndSelect('order.deceased', 'deceased');
    }

    if (includeItems) {
      queryBuilder.leftJoinAndSelect('order.orderItems', 'orderItems');
    }

    if (includePhotos) {
      queryBuilder.leftJoinAndSelect('order.photos', 'photos');
    }

    if (includeExtraCharges) {
      queryBuilder.leftJoinAndSelect('order.orderExtraCharges', 'orderExtraCharges');
    }

    return await queryBuilder.getOne();
  }

  /**
   * Get orders by customer
   */
  public async getOrdersByCustomer(
    customerId: string,
    retailerId: string,
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('order')
      .where('order.customerId = :customerId', { customerId })
      .andWhere('order.retailerId = :retailerId', { retailerId })
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  /**
   * Get orders by status
   */
  public async getOrdersByStatus(
    status: OrderStatus[],
    retailerId: string,
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('order')
      .where('order.status IN (:...status)', { status })
      .andWhere('order.retailerId = :retailerId', { retailerId })
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  /**
   * Get orders by staff member
   */
  public async getOrdersByStaff(
    staffId: string,
    retailerId: string,
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('order')
      .where('order.staffId = :staffId', { staffId })
      .andWhere('order.retailerId = :retailerId', { retailerId })
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  /**
   * Get order statistics
   */
  public async getOrderStatistics(retailerId: string): Promise<{
    totalOrders: number;
    ordersByStatus: Record<OrderStatus, number>;
    totalRevenue: number;
    averageOrderValue: number;
    todayOrders: number;
    thisWeekOrders: number;
    thisMonthOrders: number;
  }> {
    // Total orders
    const totalOrders = await this.count({ where: { retailerId } });

    // Orders by status
    const statusStats = await this.createQueryBuilder('order')
      .select('order.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .where('order.retailerId = :retailerId', { retailerId })
      .groupBy('order.status')
      .getRawMany();

    const ordersByStatus = statusStats.reduce((acc, stat) => {
      acc[stat.status] = parseInt(stat.count);
      return acc;
    }, {} as Record<OrderStatus, number>);

    // Revenue statistics
    const revenueStats = await this.createQueryBuilder('order')
      .select('SUM(order.total)', 'totalRevenue')
      .addSelect('AVG(order.total)', 'averageOrderValue')
      .where('order.retailerId = :retailerId', { retailerId })
      .getRawOne();

    // Today's orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await this.count({
      where: {
        retailerId,
        createdAt: MoreThanOrEqual(today)
      }
    });

    // This week's orders
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    weekStart.setHours(0, 0, 0, 0);
    const thisWeekOrders = await this.count({
      where: {
        retailerId,
        createdAt: MoreThanOrEqual(weekStart)
      }
    });

    // This month's orders
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const thisMonthOrders = await this.count({
      where: {
        retailerId,
        createdAt: MoreThanOrEqual(monthStart)
      }
    });

    return {
      totalOrders,
      ordersByStatus,
      totalRevenue: parseFloat(revenueStats.totalRevenue) || 0,
      averageOrderValue: parseFloat(revenueStats.averageOrderValue) || 0,
      todayOrders,
      thisWeekOrders,
      thisMonthOrders
    };
  }

  /**
   * Search orders
   */
  public async searchOrders(
    searchTerm: string,
    retailerId: string,
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('order')
      .leftJoin('order.customer', 'customer')
      .leftJoin('order.deceased', 'deceased')
      .where('order.retailerId = :retailerId', { retailerId })
      .andWhere(
        '(order.id ILIKE :search OR order.cemetery ILIKE :search OR order.location ILIKE :search OR customer.name ILIKE :search OR deceased.name ILIKE :search)',
        { search: `%${searchTerm}%` }
      )
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.deceased', 'deceased')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  /**
   * Get orders for dashboard
   */
  public async getDashboardOrders(
    retailerId: string,
    limit: number = 10
  ): Promise<{
    recentOrders: Order[];
    pendingOrders: Order[];
    completedOrders: Order[];
  }> {
    // Recent orders
    const recentOrders = await this.find({
      where: { retailerId },
      relations: ['customer', 'deceased', 'orderItems'],
      order: { createdAt: 'DESC' },
      take: limit
    });

    // Pending orders
    const pendingOrders = await this.find({
      where: {
        retailerId,
        status: In([OrderStatus.PENDING, OrderStatus.CONFIRMED, OrderStatus.IN_PROGRESS])
      },
      relations: ['customer', 'deceased', 'orderItems'],
      order: { createdAt: 'DESC' },
      take: limit
    });

    // Completed orders
    const completedOrders = await this.find({
      where: {
        retailerId,
        status: In([OrderStatus.COMPLETED, OrderStatus.DELIVERED])
      },
      relations: ['customer', 'deceased', 'orderItems'],
      order: { createdAt: 'DESC' },
      take: limit
    });

    return {
      recentOrders,
      pendingOrders,
      completedOrders
    };
  }

  /**
   * Get orders by date range
   */
  public async getOrdersByDateRange(
    startDate: Date,
    endDate: Date,
    retailerId: string,
    options: OrderListOptions = {}
  ): Promise<{ orders: Order[]; total: number }> {
    const { page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'DESC' } = options;

    const queryBuilder = this.createQueryBuilder('order')
      .where('order.retailerId = :retailerId', { retailerId })
      .andWhere('order.createdAt BETWEEN :startDate AND :endDate', { startDate, endDate })
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.deceased', 'deceased')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip((page - 1) * limit)
      .take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return { orders, total };
  }

  /**
   * Get orders for tracking page - filtered by product type and grouped by date
   */
  public async getTrackingOrders(
    retailerId: string,
    productType: string,
    status?: OrderStatus[]
  ): Promise<Order[]> {
    const queryBuilder = this.createQueryBuilder('order')
      .innerJoin('order.orderItems', 'orderItems')
      .where('order.retailerId = :retailerId', { retailerId })
      .andWhere('order.isDeleted = :isDeleted', { isDeleted: false })
      .andWhere('order.dateOfService IS NOT NULL')
      .andWhere('orderItems.productType = :productType', { productType })
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.deceased', 'deceased')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('order.staff', 'staff')
      .leftJoinAndSelect('order.director', 'director')
      .orderBy('order.dateOfService', 'ASC')
      .addOrderBy('order.timeOfService', 'ASC');

    if (status && status.length > 0) {
      queryBuilder.andWhere('order.status IN (:...status)', { status });
    } else {
      // Only show active orders (not cancelled or completed)
      queryBuilder.andWhere('order.status NOT IN (:...excludedStatus)', { 
        excludedStatus: [OrderStatus.CANCELLED, OrderStatus.COMPLETED] 
      });
    }

    return await queryBuilder.getMany();
  }

  /**
   * Apply filters to query builder
   */
  private applyFilters(queryBuilder: SelectQueryBuilder<Order>, filters: OrderFilters): void {
    if (filters.status && filters.status.length > 0) {
      queryBuilder.andWhere('order.status IN (:...status)', { status: filters.status });
    }

    if (filters.customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId: filters.customerId });
    }

    if (filters.retailerId) {
      queryBuilder.andWhere('order.retailerId = :retailerId', { retailerId: filters.retailerId });
    }

    if (filters.directorId) {
      queryBuilder.andWhere('order.directorId = :directorId', { directorId: filters.directorId });
    }

    if (filters.staffId) {
      queryBuilder.andWhere('order.staffId = :staffId', { staffId: filters.staffId });
    }

    if (filters.cemetery) {
      queryBuilder.andWhere('order.cemetery ILIKE :cemetery', { cemetery: `%${filters.cemetery}%` });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('order.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('order.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(order.id ILIKE :search OR order.cemetery ILIKE :search OR order.location ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }
  }
}