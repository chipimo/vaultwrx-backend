import { Admin } from '@api/models/Users/Admin';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Admin)
export class AdminRepository extends RepositoryBase<Admin> {
  public async createAdmin(data: object) {
    let entity = new Admin();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateAdmin(admin: Admin, data: object) {
    Object.assign(admin, data);

    return await admin.save(data);
  }
}

