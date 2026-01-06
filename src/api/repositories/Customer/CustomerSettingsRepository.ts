// repositories/CustomerSettingsRepository.ts
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { CustomerSettings } from '@base/api/models/Store-employee-management/CustomerSettings';

@EntityRepository(CustomerSettings)
export class CustomerSettingsRepository extends RepositoryBase<CustomerSettings> {
  public async createSettings(data: Partial<CustomerSettings>): Promise<CustomerSettings> {
    const settings = new CustomerSettings();
    Object.assign(settings, data);
    return await this.save(settings);
  }
}