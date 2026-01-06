// repositories/CustomerSettingPermissionRepository.ts
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { CustomerSettingPermission } from '@base/api/models/Store-employee-management/CustomerSettingPermission';

@EntityRepository(CustomerSettingPermission)
export class CustomerSettingPermissionRepository extends RepositoryBase<CustomerSettingPermission> {
  public async createPermission(data: Partial<CustomerSettingPermission>): Promise<CustomerSettingPermission> {
    const permission = new CustomerSettingPermission();
    Object.assign(permission, data);
    return await this.save(permission);
  }
}