import { EntityRepository, Repository } from 'typeorm';
import { CustomerSettings } from '@base/api/models/Store-employee-management/CustomerSettings';

@EntityRepository(CustomerSettings)
export class CustomerSettingsRepository extends Repository<CustomerSettings> {
  public async createCustomerSettings(data: Partial<CustomerSettings>): Promise<CustomerSettings> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  public async findByCustomerId(customerId: string): Promise<CustomerSettings[]> {
    return await this.find({ where: { customerId } });
  }
}
