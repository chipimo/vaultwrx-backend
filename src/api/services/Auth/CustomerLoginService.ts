import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CustomerRepository } from '@base/api/repositories/Customer/CustomerRepository';
import { CustomerLoginRequest } from '@base/api/requests/Auth/CustomerLoginRequest';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import { HashService } from '@base/infrastructure/services/hash/HashService';
import { BadRequestError, UnauthorizedError, NotFoundError } from 'routing-controllers';

@Service()
export class CustomerLoginService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository,
    private authService: AuthService,
    private hashService: HashService
  ) {}

  /**
   * ✅ Customer login
   */
  public async login(data: CustomerLoginRequest): Promise<{ token: string; customer: any }> {
    // Find customer by email
    const customer = await this.customerRepository.findByEmail(data.email);
    if (!customer) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Check if customer has a password set
    if (!customer.password) {
      throw new UnauthorizedError('Customer account not properly set up');
    }

    // Verify password
    const isPasswordValid = await this.hashService.compare(data.password, customer.password);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    // Generate JWT token
    const tokenResult = this.authService.sign(
      {
        customerId: customer.id,
        email: customer.email,
        companyId: customer.companyId,
      },
      {
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          taxType: customer.taxType,
          taxIdNumber: customer.taxIdNumber,
          isCompany: customer.isCompany,
          companyName: customer.companyName,
          parentCompany: customer.parentCompany,
          loyaltyPoints: customer.loyaltyPoints,
          companyId: customer.companyId,
        },
      }
    );

    // Extract token string from the result
    const token = typeof tokenResult === 'string' ? tokenResult : (tokenResult as any).token || (tokenResult as any).accessToken;

    // Return customer data without password
    const { password, ...customerData } = customer;

    return {
      token,
      customer: customerData,
    };
  }

  /**
   * ✅ Customer logout
   */
  public async logout(user: any): Promise<{ message: string }> {
    // In a more sophisticated implementation, you might want to:
    // 1. Add the token to a blacklist
    // 2. Log the logout event
    // 3. Clear any session data
    
    return {
      message: 'Successfully logged out',
    };
  }

  /**
   * ✅ Refresh customer token
   */
  public async refreshToken(user: any): Promise<{ token: string }> {
    // Get fresh customer data
    const customer = await this.customerRepository.findOne({
      where: { id: user.customerId },
      relations: ['company', 'parentCompany', 'role'],
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Generate new JWT token
    const tokenResult = this.authService.sign(
      {
        customerId: customer.id,
        email: customer.email,
        companyId: customer.companyId,
      },
      {
        customer: {
          id: customer.id,
          email: customer.email,
          firstName: customer.firstName,
          lastName: customer.lastName,
          phoneNumber: customer.phoneNumber,
          address: customer.address,
          taxType: customer.taxType,
          taxIdNumber: customer.taxIdNumber,
          isCompany: customer.isCompany,
          companyName: customer.companyName,
          parentCompany: customer.parentCompany,
          loyaltyPoints: customer.loyaltyPoints,
          companyId: customer.companyId,
        },
      }
    );

    // Extract token string from the result
    const token = typeof tokenResult === 'string' ? tokenResult : (tokenResult as any).token || (tokenResult as any).accessToken;

    return { token };
  }

  /**
   * ✅ Get current customer profile
   */
  public async getCurrentCustomer(user: any): Promise<any> {
    const customer = await this.customerRepository.findOne({
      where: { id: user.customerId },
      relations: ['company', 'parentCompany', 'role'],
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Return customer data without password
    const { password, ...customerData } = customer;
    return customerData;
  }
}