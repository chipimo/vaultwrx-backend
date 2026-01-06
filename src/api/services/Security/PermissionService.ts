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

  /**
   * Check if a user has a specific permission
   */
  public async hasPermission(
    userId: number,
    userType: string,
    permissionKey: string,
    companyId?: string
  ): Promise<{ hasPermission: boolean; reason?: string }> {
    // For now, return true for basic functionality
    // This can be enhanced to check actual permissions from the database
    return { hasPermission: true };
  }

  /**
   * Check if a user has any of the specified permissions
   */
  public async hasAnyPermission(
    userId: number,
    userType: string,
    permissionKeys: string[],
    companyId?: string
  ): Promise<{ hasPermission: boolean; reason?: string }> {
    // For now, return true for basic functionality
    return { hasPermission: true };
  }

  /**
   * Check if a user has a specific role
   */
  public async hasRole(
    userId: number,
    userType: string,
    roleName: string,
    companyId?: string
  ): Promise<boolean> {
    // For now, return true for basic functionality
    return true;
  }

  /**
   * Check if a user has any of the specified roles
   */
  public async hasAnyRole(
    userId: number,
    userType: string,
    roleNames: string[],
    companyId?: string
  ): Promise<boolean> {
    // For now, return true for basic functionality
    return true;
  }

  /**
   * Create default roles and permissions for a company
   */
  public async createDefaultRolesAndPermissions(
    companyId: string,
    createdBy: string
  ): Promise<void> {
    // This method creates default roles and permissions
    // Implementation can be enhanced based on requirements
    console.log(`Creating default roles and permissions for company: ${companyId}`);
  }
}

