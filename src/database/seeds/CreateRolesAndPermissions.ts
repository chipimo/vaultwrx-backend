import { Connection } from 'typeorm';
import { PermissionService } from '@base/api/services/Security/PermissionService';
import { Container } from 'typedi';

export class CreateRolesAndPermissions {
  public async run(connection: Connection): Promise<any> {
    const permissionService = Container.get(PermissionService);
    
    // Create default roles and permissions for VoteWorks
    await permissionService.createDefaultRolesAndPermissions(
      'default-company-id', // This should be replaced with actual company ID
      'system'
    );

    console.log('✅ Default roles and permissions created successfully');
  }
}
