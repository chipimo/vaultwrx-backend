import { Permission } from '@api/models/Security/Permission';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Permission)
export class PermissionRepository extends RepositoryBase<Permission> {
  public async createPermission(data: object) {
    let entity = new Permission();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updatePermission(permission: Permission, data: object) {
    Object.assign(permission, data);

    return await permission.save(data);
  }
}

