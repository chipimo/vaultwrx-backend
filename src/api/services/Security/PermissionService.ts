import { Service } from 'typedi';
import { PermissionRepository } from '@api/repositories/Security/PermissionRepository';
import { PermissionNotFoundException } from '@api/exceptions/Security/PermissionNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class PermissionService {
  constructor(
    @InjectRepository() private permissionRepository: PermissionRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.permissionRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedPermissionOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let permission = await this.permissionRepository.createPermission(data);

    this.eventDispatcher.dispatch('onPermissionCreate', permission);

    return permission;
  }

  public async updateOneById(id: number, data: object) {
    const permission = await this.getRequestedPermissionOrFail(id);

    return await this.permissionRepository.updatePermission(permission, data);
  }

  public async deleteOneById(id: number) {
    return await this.permissionRepository.delete(id);
  }

  private async getRequestedPermissionOrFail(id: number, resourceOptions?: object) {
    let permission = await this.permissionRepository.getOneById(id, resourceOptions);

    if (!permission) {
      throw new PermissionNotFoundException();
    }

    return permission;
  }
}

