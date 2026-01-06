// services/CustomerPolicyService.ts
import { CustomerPolicy } from '@base/api/models/Store-employee-management/CustomerPolicy';
import { CustomerPolicyRepository } from '@base/api/repositories/Customer/CustomerPolicyRepository';
import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class CustomerPolicyService {
  constructor(@InjectRepository() private customerPolicyRepository: CustomerPolicyRepository) {}

  public async createPolicy(data: Partial<CustomerPolicy>): Promise<CustomerPolicy> {
    return this.customerPolicyRepository.createCustomerPolicy(data);
  }
}