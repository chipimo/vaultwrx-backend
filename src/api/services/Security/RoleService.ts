import { Service } from 'typedi';
import { RoleRepository } from '@api/repositories/Users/RoleRepository';
import { RoleNotFoundException } from '@api/exceptions/Security/RoleNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class RoleService {
  constructor(
    @InjectRepository() private roleRepository: RoleRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.roleRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedRoleOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let role = await this.roleRepository.createRole(data);

    this.eventDispatcher.dispatch('onRoleCreate', role);

    return role;
  }

  public async updateOneById(id: number, data: object) {
    const role = await this.getRequestedRoleOrFail(id);

    return await this.roleRepository.updateRole(role, data);
  }

  public async deleteOneById(id: number) {
    return await this.roleRepository.delete(id);
  }

  private async getRequestedRoleOrFail(id: number, resourceOptions?: object) {
    let role = await this.roleRepository.getOneById(id, resourceOptions);

    if (!role) {
      throw new RoleNotFoundException();
    }

    return role;
  }
}

