import { Service } from 'typedi';
import { SecurityAccessControl } from '@base/api/models/Security-access-control/SecurityAccessControl';
import { getRepository, Repository } from 'typeorm';

@Service()
export class SecurityAccessControlService {
  private repository: Repository<SecurityAccessControl>;

  constructor() {
    this.repository = getRepository(SecurityAccessControl);
  }

  public async createAccessControl(data: Partial<SecurityAccessControl>): Promise<SecurityAccessControl> {
    const accessControl = this.repository.create(data);
    return await this.repository.save(accessControl);
  }

  public async getAccessControlById(id: string): Promise<SecurityAccessControl | undefined> {
    return await this.repository.findOne({ where: { id } });
  }

  public async getAccessControlsByRole(roleId: string): Promise<SecurityAccessControl[]> {
    return await this.repository.find({
      where: { role: { id: roleId } },
      relations: ['role'],
    });
  }

  public async updateAccessControl(
    id: string,
    data: Partial<SecurityAccessControl>
  ): Promise<SecurityAccessControl | undefined> {
    const accessControl = await this.getAccessControlById(id);
    if (!accessControl) {
      return undefined;
    }
    Object.assign(accessControl, data);
    return await this.repository.save(accessControl);
  }

  public async deleteAccessControl(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected || 0) > 0;
  }

  public async checkAccess(roleId: string, resource: string, action: string): Promise<boolean> {
    const accessControl = await this.repository.findOne({
      where: {
        role: { id: roleId },
        resource,
        action,
      },
    });
    return accessControl?.allowed || false;
  }
}

