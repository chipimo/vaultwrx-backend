// repositories/CustomerPolicyRepository.ts
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { CustomerPolicy } from '@base/api/models/Store-employee-management/CustomerPolicy';

@EntityRepository(CustomerPolicy)
export class CustomerPolicyRepository extends RepositoryBase<CustomerPolicy> {
  public async createCustomerPolicy(data: Partial<CustomerPolicy>): Promise<CustomerPolicy> {
    const policy = new CustomerPolicy();
    Object.assign(policy, data);
    return await this.save(policy);
  }
}