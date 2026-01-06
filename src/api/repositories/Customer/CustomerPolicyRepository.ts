import { EntityRepository, Repository } from 'typeorm';
import { CustomerPolicy } from '@base/api/models/Store-employee-management/CustomerPolicy';

@EntityRepository(CustomerPolicy)
export class CustomerPolicyRepository extends Repository<CustomerPolicy> {
  public async createCustomerPolicy(data: Partial<CustomerPolicy>): Promise<CustomerPolicy> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  public async findByCustomerId(customerId: string): Promise<CustomerPolicy[]> {
    return await this.find({ where: { customerId } });
  }
}
