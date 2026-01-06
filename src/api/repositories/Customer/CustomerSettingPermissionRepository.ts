import { EntityRepository, Repository } from 'typeorm';
import { CustomerSettingPermission } from '@base/api/models/Store-employee-management/CustomerSettingPermission';

@EntityRepository(CustomerSettingPermission)
export class CustomerSettingPermissionRepository extends Repository<CustomerSettingPermission> {
  public async createCustomerSettingPermission(data: Partial<CustomerSettingPermission>): Promise<CustomerSettingPermission> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  public async findByCustomerId(customerId: string): Promise<CustomerSettingPermission[]> {
    return await this.find({ where: { customerId } });
  }
}
