// repositories/CustomerRepository.ts
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Customer } from '@base/api/models/Store-employee-management/Customer';

@EntityRepository(Customer)
export class CustomerRepository extends RepositoryBase<Customer> {
  /**
   * Create and save a new customer.
   * @param data - Partial data for the customer.
   * @returns The newly created customer.
   */
  public async createCustomer(data: Partial<Customer>): Promise<Customer> {
    const entity = new Customer();
    Object.assign(entity, data);
    return await this.save(entity);
  }

  /**
   * Update an existing customer.
   * @param customer - The customer entity to update.
   * @param data - The new data to update.
   * @returns The updated customer.
   */
  public async updateCustomer(customer: Customer, data: Partial<Customer>): Promise<Customer> {
    Object.assign(customer, data);
    return await this.save(customer);
  }

  /**
   * Find a customer by email.
   * @param email - The customer's email address.
   * @returns The customer or undefined if not found.
   */
  public async findByEmail(email: string): Promise<Customer | undefined> {
    return this.createQueryBuilder('customer')
      .where('customer.email = :email', { email })
      .getOne();
  }

  /**
   * Find a customer by their unique customerId.
   * @param customerId - The customer's unique identifier.
   * @returns The customer or undefined if not found.
   */
  public async findByCustomerId(customerId: string): Promise<Customer | undefined> {
    return this.createQueryBuilder('customer')
      .where('customer.customerId = :customerId', { customerId })
      .getOne();
  }

  /**
   * Find customers by matching full name (first name + last name).
   * @param fullName - Partial or full name string to search.
   * @returns An array of matching customers.
   */
  public async findByFullName(fullName: string): Promise<Customer[]> {
    return this.createQueryBuilder('customer')
      .where("CONCAT(customer.firstName, ' ', customer.lastName) LIKE :fullName", { fullName: `%${fullName}%` })
      .getMany();
  }

  /**
   * Find customers with loyalty points equal to or above a specified minimum.
   * @param minPoints - The minimum loyalty points.
   * @returns An array of customers meeting the criteria.
   */
  public async findByLoyaltyPoints(minPoints: number): Promise<Customer[]> {
    return this.createQueryBuilder('customer')
      .where('customer.loyaltyPoints >= :minPoints', { minPoints })
      .getMany();
  }

  /**
   * Find customers by company ID with pagination and filtering
   * @param companyId - The company ID
   * @param filters - Filter criteria
   * @param page - Page number
   * @param limit - Number of items per page
   * @returns Paginated customers
   */
  public async findCustomersByCompany(
    companyId: string,
    filters: any = {},
    page: number = 1,
    limit: number = 10
  ): Promise<{ customers: Customer[]; total: number }> {
    const queryBuilder = this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .leftJoinAndSelect('customer.parentCompany', 'parentCompany')
      .where('customer.companyId = :companyId', { companyId });

    // Apply filters
    if (filters.searchTerm) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :searchTerm OR customer.lastName ILIKE :searchTerm OR customer.email ILIKE :searchTerm OR customer.companyName ILIKE :searchTerm)',
        { searchTerm: `%${filters.searchTerm}%` }
      );
    }

    if (filters.isCompany !== undefined) {
      queryBuilder.andWhere('customer.isCompany = :isCompany', { isCompany: filters.isCompany });
    }

    if (filters.taxType) {
      queryBuilder.andWhere('customer.taxType = :taxType', { taxType: filters.taxType });
    }

    if (filters.minLoyaltyPoints !== undefined) {
      queryBuilder.andWhere('customer.loyaltyPoints >= :minLoyaltyPoints', { minLoyaltyPoints: filters.minLoyaltyPoints });
    }

    if (filters.maxLoyaltyPoints !== undefined) {
      queryBuilder.andWhere('customer.loyaltyPoints <= :maxLoyaltyPoints', { maxLoyaltyPoints: filters.maxLoyaltyPoints });
    }

    if (filters.parentCompanyId) {
      queryBuilder.andWhere('customer.parentCompanyId = :parentCompanyId', { parentCompanyId: filters.parentCompanyId });
    }

    if (filters.roleId) {
      queryBuilder.andWhere('customer.roleId = :roleId', { roleId: filters.roleId });
    }

    if (filters.dateFrom) {
      queryBuilder.andWhere('customer.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }

    if (filters.dateTo) {
      queryBuilder.andWhere('customer.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }

    // Apply sorting
    const sortBy = filters.sortBy || 'createdAt';
    const sortOrder = filters.sortOrder || 'DESC';
    queryBuilder.orderBy(`customer.${sortBy}`, sortOrder);

    // Apply pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [customers, total] = await queryBuilder.getManyAndCount();

    return { customers, total };
  }

  /**
   * Find customers by multiple criteria
   * @param criteria - Search criteria
   * @returns Array of matching customers
   */
  public async findByCriteria(criteria: any): Promise<Customer[]> {
    const queryBuilder = this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .leftJoinAndSelect('customer.parentCompany', 'parentCompany');

    if (criteria.companyId) {
      queryBuilder.where('customer.companyId = :companyId', { companyId: criteria.companyId });
    }

    if (criteria.customerIds && criteria.customerIds.length > 0) {
      queryBuilder.andWhere('customer.id IN (:...customerIds)', { customerIds: criteria.customerIds });
    }

    if (criteria.isCompany !== undefined) {
      queryBuilder.andWhere('customer.isCompany = :isCompany', { isCompany: criteria.isCompany });
    }

    if (criteria.taxType) {
      queryBuilder.andWhere('customer.taxType = :taxType', { taxType: criteria.taxType });
    }

    if (criteria.minLoyaltyPoints !== undefined) {
      queryBuilder.andWhere('customer.loyaltyPoints >= :minLoyaltyPoints', { minLoyaltyPoints: criteria.minLoyaltyPoints });
    }

    if (criteria.maxLoyaltyPoints !== undefined) {
      queryBuilder.andWhere('customer.loyaltyPoints <= :maxLoyaltyPoints', { maxLoyaltyPoints: criteria.maxLoyaltyPoints });
    }

    if (criteria.hasOrders) {
      queryBuilder.andWhere('customer.orders IS NOT NULL');
    }

    if (criteria.hasPayments) {
      queryBuilder.andWhere('customer.payments IS NOT NULL');
    }

    if (criteria.hasInvoices) {
      queryBuilder.andWhere('customer.invoices IS NOT NULL');
    }

    return queryBuilder.getMany();
  }

  /**
   * Get customer statistics for a company
   * @param companyId - The company ID
   * @returns Customer statistics
   */
  public async getCustomerStats(companyId: string): Promise<{
    totalCustomers: number;
    companyCustomers: number;
    individualCustomers: number;
    totalLoyaltyPoints: number;
    averageLoyaltyPoints: number;
    customersWithOrders: number;
    customersWithPayments: number;
    customersWithInvoices: number;
  }> {
    const totalCustomers = await this.count({ where: { companyId } });
    const companyCustomers = await this.count({ where: { companyId, isCompany: true } });
    const individualCustomers = await this.count({ where: { companyId, isCompany: false } });

    const loyaltyStats = await this
      .createQueryBuilder('customer')
      .select('SUM(customer.loyaltyPoints)', 'total')
      .addSelect('AVG(customer.loyaltyPoints)', 'average')
      .where('customer.companyId = :companyId', { companyId })
      .getRawOne();

    const customersWithOrders = await this
      .createQueryBuilder('customer')
      .leftJoin('customer.orders', 'orders')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('orders.id IS NOT NULL')
      .getCount();

    const customersWithPayments = await this
      .createQueryBuilder('customer')
      .leftJoin('customer.payments', 'payments')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('payments.id IS NOT NULL')
      .getCount();

    const customersWithInvoices = await this
      .createQueryBuilder('customer')
      .leftJoin('customer.invoices', 'invoices')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('invoices.id IS NOT NULL')
      .getCount();

    return {
      totalCustomers,
      companyCustomers,
      individualCustomers,
      totalLoyaltyPoints: parseInt(loyaltyStats.total) || 0,
      averageLoyaltyPoints: parseFloat(loyaltyStats.average) || 0,
      customersWithOrders,
      customersWithPayments,
      customersWithInvoices,
    };
  }

  /**
   * Find customers by loyalty points range
   * @param companyId - The company ID
   * @param minPoints - Minimum loyalty points
   * @param maxPoints - Maximum loyalty points
   * @returns Array of customers in the range
   */
  public async findByLoyaltyPointsRange(
    companyId: string,
    minPoints: number,
    maxPoints: number
  ): Promise<Customer[]> {
    return this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('customer.loyaltyPoints >= :minPoints', { minPoints })
      .andWhere('customer.loyaltyPoints <= :maxPoints', { maxPoints })
      .orderBy('customer.loyaltyPoints', 'DESC')
      .getMany();
  }

  /**
   * Find top customers by loyalty points
   * @param companyId - The company ID
   * @param limit - Number of top customers to return
   * @returns Array of top customers
   */
  public async findTopCustomersByLoyalty(companyId: string, limit: number = 10): Promise<Customer[]> {
    return this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .where('customer.companyId = :companyId', { companyId })
      .orderBy('customer.loyaltyPoints', 'DESC')
      .limit(limit)
      .getMany();
  }

  /**
   * Find customers created within a date range
   * @param companyId - The company ID
   * @param startDate - Start date
   * @param endDate - End date
   * @returns Array of customers created in the range
   */
  public async findByDateRange(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Customer[]> {
    return this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('customer.createdAt >= :startDate', { startDate })
      .andWhere('customer.createdAt <= :endDate', { endDate })
      .orderBy('customer.createdAt', 'DESC')
      .getMany();
  }

  /**
   * Find customers by tax type
   * @param companyId - The company ID
   * @param taxType - Tax type to search for
   * @returns Array of customers with the tax type
   */
  public async findByTaxType(companyId: string, taxType: string): Promise<Customer[]> {
    return this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('customer.taxType = :taxType', { taxType })
      .orderBy('customer.firstName', 'ASC')
      .getMany();
  }

  /**
   * Find customers by role
   * @param companyId - The company ID
   * @param roleId - Role ID to search for
   * @returns Array of customers with the role
   */
  public async findByRole(companyId: string, roleId: string): Promise<Customer[]> {
    return this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere('customer.roleId = :roleId', { roleId })
      .orderBy('customer.firstName', 'ASC')
      .getMany();
  }

  /**
   * Find customers with recent activity (orders, payments, invoices)
   * @param companyId - The company ID
   * @param days - Number of days to look back
   * @returns Array of customers with recent activity
   */
  public async findWithRecentActivity(companyId: string, days: number = 30): Promise<Customer[]> {
    const dateThreshold = new Date();
    dateThreshold.setDate(dateThreshold.getDate() - days);

    return this.createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .leftJoinAndSelect('customer.company', 'company')
      .leftJoinAndSelect('customer.orders', 'orders')
      .leftJoinAndSelect('customer.payments', 'payments')
      .leftJoinAndSelect('customer.invoices', 'invoices')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere(
        '(orders.createdAt >= :dateThreshold OR payments.createdAt >= :dateThreshold OR invoices.createdAt >= :dateThreshold)',
        { dateThreshold }
      )
      .orderBy('customer.updatedAt', 'DESC')
      .getMany();
  }
}