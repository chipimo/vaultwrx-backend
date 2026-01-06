import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import { CustomerRepository } from '@base/api/repositories/Customer/CustomerRepository';
import { RegisterCustomerRequest } from '@base/api/requests/Auth/RegisterCustomerRequest';

@Service()
export class CustomerRegisterService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private authService: AuthService,
  ) {}

  public async register(data: RegisterCustomerRequest): Promise<object> {
    // Create a new customer record
    let customer = await this.customerRepository.createCustomer(data);

    // Reload the customer with additional relations (e.g., parentCompany)
    customer = await this.customerRepository.findOne({
      where: { id: customer.id },
      relations: ['parentCompany'],
    });

    // Dispatch a registration event for further processing (e.g., sending welcome email)
    this.eventDispatcher.dispatch('onCustomerRegister', customer);

    // Sign a JWT with the customer's key details
    return this.authService.sign(
      {
        customerId: customer.id,
        email: customer.email,
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
        },
      },
    );
  }
}