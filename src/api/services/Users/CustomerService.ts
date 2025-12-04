import { Service } from 'typedi';
import { CustomerRepository } from '@api/repositories/Users/CustomerRepository';
import { CustomerNotFoundException } from '@api/exceptions/Users/CustomerNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class CustomerService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.customerRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedCustomerOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let customer = await this.customerRepository.createCustomer(data, companyId);

    this.eventDispatcher.dispatch('onCustomerCreate', customer);

    return customer;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const customer = await this.getRequestedCustomerOrFail(id, undefined, companyId);

    return await this.customerRepository.updateCustomer(customer, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const customer = await this.getRequestedCustomerOrFail(id, undefined, companyId);
      return await this.customerRepository.delete(customer.id);
    }
    return await this.customerRepository.delete(id);
  }

  private async getRequestedCustomerOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let customer = await this.customerRepository.getOneById(id, resourceOptions, companyId);

    if (!customer) {
      throw new CustomerNotFoundException();
    }

    return customer;
  }
}

