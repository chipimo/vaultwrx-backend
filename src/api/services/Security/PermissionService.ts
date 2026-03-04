import { Service } from 'typedi';
import { PermissionRepository } from '@api/repositories/Security/PermissionRepository';
import { PermissionNotFoundException } from '@api/exceptions/Security/PermissionNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

export interface PermissionCheckResult {
  hasPermission: boolean;
  reason?: string;
}

@Service()
export class PermissionService {
  constructor(
    @InjectRepository() private permissionRepository: PermissionRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  /** Check if user has a specific permission (userId, userType, permissionKey, companyId). */
  public async hasPermission(
    _userId: number | string,
    _userType: string,
    _permissionKey: string,
    _companyId?: string
  ): Promise<PermissionCheckResult> {
    // TODO: implement via user/role/permission lookup
    return { hasPermission: true };
  }

  /** Check if user has any of the given permissions. */
  public async hasAnyPermission(
    _userId: number | string,
    _userType: string,
    _permissionKeys: string[],
    _companyId?: string
  ): Promise<PermissionCheckResult> {
    // TODO: implement via user/role/permission lookup
    return { hasPermission: true };
  }

  /** Check if user has a specific role. */
  public async hasRole(
    _userId: number | string,
    _userType: string,
    _roleName: string,
    _companyId?: string
  ): Promise<boolean> {
    // TODO: implement via user/role lookup
    return true;
  }

  /** Check if user has any of the given roles. */
  public async hasAnyRole(
    _userId: number | string,
    _userType: string,
    _roleNames: string[],
    _companyId?: string
  ): Promise<boolean> {
    // TODO: implement via user/role lookup
    return true;
  }

  /** Create default roles and permissions for a company. */
  public async createDefaultRolesAndPermissions(_companyId: string, _source: string): Promise<void> {
    // TODO: implement default role/permission seeding
  }

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

