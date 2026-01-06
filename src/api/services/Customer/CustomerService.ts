import { Customer } from '@base/api/models/Store-employee-management/Customer';
import { CustomerRepository } from '@base/api/repositories/Customer/CustomerRepository';
import { RoleRepository } from '@base/api/repositories/Employee/RoleRepository';
import { CreateCustomerDto } from '@base/api/dtos/CreateCustomerDto';
import { UpdateCustomerDto } from '@base/api/dtos/UpdateCustomerDto';
import { CustomerSearchDto } from '@base/api/dtos/CustomerSearchDto';
import { CustomerFilterDto } from '@base/api/dtos/CustomerFilterDto';
import { CustomerProfileUpdateRequest } from '@base/api/requests/Customers/CustomerProfileUpdateRequest';
import { CustomerChangePasswordRequest } from '@base/api/requests/Auth/CustomerChangePasswordRequest';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'routing-controllers';
import { Role } from '@base/api/models/Store-employee-management/Role';
import { HashService } from '@base/infrastructure/services/hash/HashService';

@Service()
export class CustomerService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository,
    @InjectRepository() private roleRepository: RoleRepository,
    private hashService: HashService
  ) {}

  /**
   * ✅ Remove password from customer object
   */
  private removePasswordFromCustomer(customer: any): any {
    if (!customer) return customer;
    
    const { password, ...customerWithoutPassword } = customer;
    return customerWithoutPassword;
  }

  /**
   * ✅ Remove password from customer array
   */
  private removePasswordFromCustomers(customers: any[]): any[] {
    return customers.map(customer => this.removePasswordFromCustomer(customer));
  }

  // Company validation removed

  /**
   * ✅ Create a new customer
   */
  public async createCustomer(data: CreateCustomerDto): Promise<Customer> {
    // Check if email already exists
    const existingCustomer = await this.customerRepository.findByEmail(data.email);
    if (existingCustomer) {
      throw new BadRequestError('Customer with this email already exists');
    }

    // Validate role if provided
    let role: Role | null = null;
    if (data.roleId) {
      role = await this.roleRepository.findOne({ where: { id: data.roleId } });
      if (!role) {
        throw new NotFoundError('Role not found');
      }
    }

    // Hash password if provided
    let hashedPassword: string | undefined;
    if (data.password) {
      hashedPassword = await this.hashService.make(data.password);
    }

    const customerData = {
      ...data,
      password: hashedPassword,
      role,
      loyaltyPoints: data.loyaltyPoints || 0,
      isCompany: data.isCompany || false,
    };

    return await this.customerRepository.createCustomer(customerData);
  }

  /**
   * ✅ Get all customers with pagination and filtering
   */
  public async getCustomers(
    companyId: string,
    searchDto: CustomerSearchDto,
    filterDto: CustomerFilterDto
  ): Promise<{ customers: Customer[]; total: number; page: number; limit: number }> {
    const page = searchDto.page || 1;
    const limit = searchDto.limit || 10;
    const skip = (page - 1) * limit;

    const queryBuilder = this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .where('customer.companyId = :companyId', { companyId });

    // Apply search filters
    if (searchDto.searchTerm) {
      queryBuilder.andWhere(
        '(customer.firstName ILIKE :searchTerm OR customer.lastName ILIKE :searchTerm OR customer.email ILIKE :searchTerm OR customer.companyName ILIKE :searchTerm)',
        { searchTerm: `%${searchDto.searchTerm}%` }
      );
    }

    if (searchDto.firstName) {
      queryBuilder.andWhere('customer.firstName ILIKE :firstName', { firstName: `%${searchDto.firstName}%` });
    }

    if (searchDto.lastName) {
      queryBuilder.andWhere('customer.lastName ILIKE :lastName', { lastName: `%${searchDto.lastName}%` });
    }

    if (searchDto.email) {
      queryBuilder.andWhere('customer.email ILIKE :email', { email: `%${searchDto.email}%` });
    }

    if (searchDto.phoneNumber) {
      queryBuilder.andWhere('customer.phoneNumber ILIKE :phoneNumber', { phoneNumber: `%${searchDto.phoneNumber}%` });
    }

    if (searchDto.companyName) {
      queryBuilder.andWhere('customer.companyName ILIKE :companyName', { companyName: `%${searchDto.companyName}%` });
    }

    if (searchDto.isCompany !== undefined) {
      queryBuilder.andWhere('customer.isCompany = :isCompany', { isCompany: searchDto.isCompany });
    }

    if (searchDto.taxType) {
      queryBuilder.andWhere('customer.taxType = :taxType', { taxType: searchDto.taxType });
    }

    if (searchDto.minLoyaltyPoints !== undefined) {
      queryBuilder.andWhere('customer.loyaltyPoints >= :minLoyaltyPoints', { minLoyaltyPoints: searchDto.minLoyaltyPoints });
    }

    if (searchDto.maxLoyaltyPoints !== undefined) {
      queryBuilder.andWhere('customer.loyaltyPoints <= :maxLoyaltyPoints', { maxLoyaltyPoints: searchDto.maxLoyaltyPoints });
    }

    if (searchDto.parentCompanyId) {
      queryBuilder.andWhere('customer.parentCompanyId = :parentCompanyId', { parentCompanyId: searchDto.parentCompanyId });
    }

    if (searchDto.roleId) {
      queryBuilder.andWhere('customer.roleId = :roleId', { roleId: searchDto.roleId });
    }

    // Apply additional filters
    if (filterDto.customerIds && filterDto.customerIds.length > 0) {
      queryBuilder.andWhere('customer.id IN (:...customerIds)', { customerIds: filterDto.customerIds });
    }

    if (filterDto.dateFrom) {
      queryBuilder.andWhere('customer.createdAt >= :dateFrom', { dateFrom: filterDto.dateFrom });
    }

    if (filterDto.dateTo) {
      queryBuilder.andWhere('customer.createdAt <= :dateTo', { dateTo: filterDto.dateTo });
    }

    // Apply sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';
    queryBuilder.orderBy(`customer.${sortBy}`, sortOrder);

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    const [customers, total] = await queryBuilder.getManyAndCount();

    return {
      customers: this.removePasswordFromCustomers(customers),
      total,
      page,
      limit,
    };
  }

  /**
   * ✅ Get customer by ID
   */
  public async getCustomerById(id: string, companyId: string): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id, companyId },
      relations: ['role', 'orders', 'payments', 'invoices'],
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    return this.removePasswordFromCustomer(customer);
  }

  /**
   * ✅ Update customer
   */
  public async updateCustomer(id: string, companyId: string, data: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.getCustomerById(id, companyId);

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(data.email);
      if (existingCustomer && existingCustomer.id !== id) {
        throw new BadRequestError('Customer with this email already exists');
      }
    }

    // Hash new password if provided
    if (data.password) {
      data.password = await this.hashService.make(data.password);
    }

    // Validate role if being updated
    if (data.roleId) {
      const role = await this.roleRepository.findOne({ where: { id: data.roleId } });
      if (!role) {
        throw new NotFoundError('Role not found');
      }
    }

    const updatedCustomer = await this.customerRepository.updateCustomer(customer, data);
    return this.removePasswordFromCustomer(updatedCustomer);
  }

  /**
   * ✅ Delete customer
   */
  public async deleteCustomer(id: string, companyId: string): Promise<boolean> {
    // Check if customer exists using raw SQL
    const customerExists = await this.customerRepository.query(
      'SELECT id FROM customers WHERE id = $1 AND "companyId" = $2',
      [id, companyId]
    );

    if (!customerExists || customerExists.length === 0) {
      throw new NotFoundError('Customer not found');
    }

    // Check if customer has related records using direct table queries
    const ordersCount = await this.customerRepository.query(
      'SELECT COUNT(*) as count FROM orders WHERE "customerId" = $1',
      [id]
    );

    const paymentsCount = await this.customerRepository.query(
      'SELECT COUNT(*) as count FROM payments WHERE "customerId" = $1',
      [id]
    );

    const invoicesCount = await this.customerRepository.query(
      'SELECT COUNT(*) as count FROM invoices WHERE "customerId" = $1',
      [id]
    );

    const hasOrders = parseInt(ordersCount[0]?.count || '0') > 0;
    const hasPayments = parseInt(paymentsCount[0]?.count || '0') > 0;
    const hasInvoices = parseInt(invoicesCount[0]?.count || '0') > 0;

    if (hasOrders || hasPayments || hasInvoices) {
      throw new BadRequestError('Cannot delete customer with existing orders, payments, or invoices');
    }

    // Delete customer using raw SQL
    await this.customerRepository.query(
      'DELETE FROM customers WHERE id = $1 AND "companyId" = $2',
      [id, companyId]
    );

    return true;
  }

  /**
   * ✅ Update customer profile (for customer self-service)
   */
  public async updateCustomerProfile(customerId: string, data: CustomerProfileUpdateRequest): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Check if email is being changed and if it already exists
    if (data.email && data.email !== customer.email) {
      const existingCustomer = await this.customerRepository.findByEmail(data.email);
      if (existingCustomer && existingCustomer.id !== customerId) {
        throw new BadRequestError('Customer with this email already exists');
      }
    }

    const updatedCustomer = await this.customerRepository.updateCustomer(customer, data);
    return this.removePasswordFromCustomer(updatedCustomer);
  }

  /**
   * ✅ Change customer password
   */
  public async changeCustomerPassword(customerId: string, data: CustomerChangePasswordRequest): Promise<boolean> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Verify current password
    if (!customer.password) {
      throw new BadRequestError('Customer has no password set');
    }

    const isCurrentPasswordValid = await this.hashService.compare(data.currentPassword, customer.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password confirmation
    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestError('New password and confirmation do not match');
    }

    // Hash and update password
    const hashedNewPassword = await this.hashService.make(data.newPassword);
    await this.customerRepository.updateCustomer(customer, { password: hashedNewPassword });

    return true;
  }

  /**
   * ✅ Update customer loyalty points
   */
  public async updateLoyaltyPoints(customerId: string, points: number, companyId: string): Promise<Customer> {
    const customer = await this.getCustomerById(customerId, companyId);
    
    const newPoints = Math.max(0, customer.loyaltyPoints + points);
    const updatedCustomer = await this.customerRepository.updateCustomer(customer, { loyaltyPoints: newPoints });
    return this.removePasswordFromCustomer(updatedCustomer);
  }

  /**
   * ✅ Get customer statistics
   */
  public async getCustomerStats(companyId: string): Promise<{
    totalCustomers: number;
    companyCustomers: number;
    individualCustomers: number;
    totalLoyaltyPoints: number;
    averageLoyaltyPoints: number;
  }> {
    const totalCustomers = await this.customerRepository.count({ where: { companyId } });
    const companyCustomers = await this.customerRepository.count({ where: { companyId, isCompany: true } });
    const individualCustomers = await this.customerRepository.count({ where: { companyId, isCompany: false } });

    const loyaltyStats = await this.customerRepository
      .createQueryBuilder('customer')
      .select('SUM(customer.loyaltyPoints)', 'total')
      .addSelect('AVG(customer.loyaltyPoints)', 'average')
      .where('customer.companyId = :companyId', { companyId })
      .getRawOne();

    return {
      totalCustomers,
      companyCustomers,
      individualCustomers,
      totalLoyaltyPoints: parseInt(loyaltyStats.total) || 0,
      averageLoyaltyPoints: parseFloat(loyaltyStats.average) || 0,
    };
  }

  /**
   * ✅ Search customers by various criteria
   */
  public async searchCustomers(companyId: string, searchTerm: string): Promise<Customer[]> {
    return await this.customerRepository
      .createQueryBuilder('customer')
      .leftJoinAndSelect('customer.role', 'role')
      .where('customer.companyId = :companyId', { companyId })
      .andWhere(
        '(customer.firstName ILIKE :searchTerm OR customer.lastName ILIKE :searchTerm OR customer.email ILIKE :searchTerm OR customer.companyName ILIKE :searchTerm OR customer.phoneNumber ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` }
      )
      .orderBy('customer.firstName', 'ASC')
      .limit(20)
      .getMany();
  }

  /**
   * ✅ Get customers by loyalty points range
   */
  public async getCustomersByLoyaltyRange(companyId: string, minPoints: number, maxPoints: number): Promise<Customer[]> {
    const customers = await this.customerRepository.findByLoyaltyPointsRange(companyId, minPoints, maxPoints);
    return this.removePasswordFromCustomers(customers);
  }

  /**
   * ✅ Get top customers by loyalty points
   */
  public async getTopCustomersByLoyalty(companyId: string, limit: number = 10): Promise<Customer[]> {
    const customers = await this.customerRepository.findTopCustomersByLoyalty(companyId, limit);
    return this.removePasswordFromCustomers(customers);
  }

  /**
   * ✅ Get customers by tax type
   */
  public async getCustomersByTaxType(companyId: string, taxType: string): Promise<Customer[]> {
    const customers = await this.customerRepository.findByTaxType(companyId, taxType);
    return this.removePasswordFromCustomers(customers);
  }

  /**
   * ✅ Get customers by role
   */
  public async getCustomersByRole(companyId: string, roleId: string): Promise<Customer[]> {
    const customers = await this.customerRepository.findByRole(companyId, roleId);
    return this.removePasswordFromCustomers(customers);
  }

  /**
   * ✅ Get customers with recent activity
   */
  public async getCustomersWithRecentActivity(companyId: string, days: number = 30): Promise<Customer[]> {
    const customers = await this.customerRepository.findWithRecentActivity(companyId, days);
    return this.removePasswordFromCustomers(customers);
  }

  /**
   * ✅ Get customers by date range
   */
  public async getCustomersByDateRange(companyId: string, startDate: Date, endDate: Date): Promise<Customer[]> {
    const customers = await this.customerRepository.findByDateRange(companyId, startDate, endDate);
    return this.removePasswordFromCustomers(customers);
  }

  /**
   * ✅ Get all customers for a specific company (legacy method)
   */
  public async getAllCustomers(companyId: string): Promise<Customer[]> {
    const customers = await this.customerRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' }
    });
    
    return this.removePasswordFromCustomers(customers);
  }
}