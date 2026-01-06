import { EntityRepository, Repository } from 'typeorm';
import { Role } from '@base/api/models/Store-employee-management/Role';

@EntityRepository(Role)
export class RoleRepository extends Repository<Role> {
  public async createRole(data: Partial<Role>): Promise<Role> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  public async findByName(name: string): Promise<Role | undefined> {
    return await this.findOne({ where: { name } });
  }

  public async findByCompanyId(companyId: string): Promise<Role[]> {
    return await this.find({ where: { companyId } });
  }
}

