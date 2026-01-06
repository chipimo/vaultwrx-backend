// repositories/SecurityAccessControlRepository.ts
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { SecurityAccessControl } from '@base/api/models/Security-access-control/SecurityAccessControl';

@EntityRepository(SecurityAccessControl)
export class SecurityAccessControlRepository extends RepositoryBase<SecurityAccessControl> {
  public async createAccessControl(data: Partial<SecurityAccessControl>): Promise<SecurityAccessControl> {
    const rule = new SecurityAccessControl();
    Object.assign(rule, data);
    return await this.save(rule);
  }
}