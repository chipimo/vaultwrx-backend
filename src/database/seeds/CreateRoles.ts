import { Factory, Seeder } from 'typeorm-seeding';
import { Connection } from 'typeorm/connection/Connection';
import { RoleRepository } from '@base/api/repositories/Users/RoleRepository';
import { Role, RoleType } from '@api/models/Security/Role';
import { Permission, PermissionAction, PermissionResource } from '@api/models/Security/Permission';

export default class CreateRoles implements Seeder {
  public async run(factory: Factory, connection: Connection): Promise<any> {
    const roleRepository = connection.getCustomRepository(RoleRepository);
    const permissionRepository = connection.getRepository(Permission);

    // Create all permissions first
    const allPermissions: Permission[] = [];
    const resources = Object.values(PermissionResource);
    const actions = Object.values(PermissionAction);

    for (const resource of resources) {
      for (const action of actions) {
        let permission = await permissionRepository.findOne({
          where: { resource, action },
        });

        if (!permission) {
          permission = permissionRepository.create({
            resource,
            action,
            description: `Permission to ${action} ${resource}`,
          });
          permission = await permissionRepository.save(permission);
        }
        allPermissions.push(permission);
      }
    }

    // Create Admin role with all permissions
    let adminRole = await roleRepository.findOne({ where: { name: 'Admin' } });
    if (!adminRole) {
      adminRole = roleRepository.create({
        name: 'Admin',
        type: RoleType.ADMIN,
        description: 'Administrator with full system access',
        permissions: allPermissions,
      });
      adminRole = await roleRepository.save(adminRole);
    } else {
      // Update existing admin role
      adminRole.type = RoleType.ADMIN;
      adminRole.description = 'Administrator with full system access';
      adminRole.permissions = allPermissions;
      await roleRepository.save(adminRole);
    }

    // Create Retailer role with company-specific permissions
    const retailerPermissions = allPermissions.filter(
      (p) =>
        (p.resource === PermissionResource.COMPANIES && p.action === PermissionAction.READ) ||
        (p.resource === PermissionResource.COMPANIES && p.action === PermissionAction.EDIT) ||
        (p.resource === PermissionResource.STAFF && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT, PermissionAction.DELETE].includes(p.action)) ||
        (p.resource === PermissionResource.ORDERS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT].includes(p.action)) ||
        (p.resource === PermissionResource.PRODUCTS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT, PermissionAction.DELETE].includes(p.action)) ||
        (p.resource === PermissionResource.REPORTS && PermissionAction.READ === p.action)
    );

    let retailerRole = await roleRepository.findOne({ where: { name: 'Retailer' } });
    if (!retailerRole) {
      retailerRole = roleRepository.create({
        name: 'Retailer',
        type: RoleType.RETAILER,
        description: 'Retailer with access to their own company and staff',
        permissions: retailerPermissions,
      });
      retailerRole = await roleRepository.save(retailerRole);
    } else {
      retailerRole.type = RoleType.RETAILER;
      retailerRole.description = 'Retailer with access to their own company and staff';
      retailerRole.permissions = retailerPermissions;
      await roleRepository.save(retailerRole);
    }

    // Create Customer role with limited permissions
    const customerPermissions = allPermissions.filter(
      (p) =>
        (p.resource === PermissionResource.ORDERS && [PermissionAction.READ, PermissionAction.CREATE].includes(p.action)) ||
        (p.resource === PermissionResource.PRODUCTS && PermissionAction.READ === p.action)
    );

    let customerRole = await roleRepository.findOne({ where: { name: 'Customer' } });
    if (!customerRole) {
      customerRole = roleRepository.create({
        name: 'Customer',
        type: RoleType.CUSTOMER,
        description: 'Customer with limited access to customer portal',
        permissions: customerPermissions,
      });
      customerRole = await roleRepository.save(customerRole);
    } else {
      customerRole.type = RoleType.CUSTOMER;
      customerRole.description = 'Customer with limited access to customer portal';
      customerRole.permissions = customerPermissions;
      await roleRepository.save(customerRole);
    }

    // Create Staff role with limited permissions (under retailer)
    const staffPermissions = allPermissions.filter(
      (p) =>
        (p.resource === PermissionResource.ORDERS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT].includes(p.action)) ||
        (p.resource === PermissionResource.PRODUCTS && [PermissionAction.READ, PermissionAction.EDIT].includes(p.action)) ||
        (p.resource === PermissionResource.CUSTOMERS && PermissionAction.READ === p.action)
    );

    let staffRole = await roleRepository.findOne({ where: { name: 'Staff' } });
    if (!staffRole) {
      staffRole = roleRepository.create({
        name: 'Staff',
        type: RoleType.STAFF,
        description: 'Staff member with limited permissions under a retailer',
        permissions: staffPermissions,
      });
      staffRole = await roleRepository.save(staffRole);
    } else {
      staffRole.type = RoleType.STAFF;
      staffRole.description = 'Staff member with limited permissions under a retailer';
      staffRole.permissions = staffPermissions;
      await roleRepository.save(staffRole);
    }

    // Create Funeral Director role with funeral service permissions
    const funeralDirectorPermissions = allPermissions.filter(
      (p) =>
        (p.resource === PermissionResource.ORDERS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT, PermissionAction.DELETE].includes(p.action)) ||
        (p.resource === PermissionResource.CUSTOMERS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT].includes(p.action)) ||
        (p.resource === PermissionResource.PRODUCTS && [PermissionAction.READ, PermissionAction.EDIT].includes(p.action)) ||
        (p.resource === PermissionResource.REPORTS && PermissionAction.READ === p.action) ||
        (p.resource === PermissionResource.FUNERAL_DIRECTORS && [PermissionAction.READ, PermissionAction.EDIT].includes(p.action))
    );

    let funeralDirectorRole = await roleRepository.findOne({ where: { name: 'Funeral Director' } });
    if (!funeralDirectorRole) {
      funeralDirectorRole = roleRepository.create({
        name: 'Funeral Director',
        type: RoleType.FUNERAL_DIRECTOR,
        description: 'Funeral director with permissions to manage funeral services and customers',
        permissions: funeralDirectorPermissions,
      });
      funeralDirectorRole = await roleRepository.save(funeralDirectorRole);
    } else {
      funeralDirectorRole.type = RoleType.FUNERAL_DIRECTOR;
      funeralDirectorRole.description = 'Funeral director with permissions to manage funeral services and customers';
      funeralDirectorRole.permissions = funeralDirectorPermissions;
      await roleRepository.save(funeralDirectorRole);
    }

    // Update Retailer permissions to include funeral directors management
    const updatedRetailerPermissions = allPermissions.filter(
      (p) =>
        (p.resource === PermissionResource.COMPANIES && p.action === PermissionAction.READ) ||
        (p.resource === PermissionResource.COMPANIES && p.action === PermissionAction.EDIT) ||
        (p.resource === PermissionResource.STAFF && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT, PermissionAction.DELETE].includes(p.action)) ||
        (p.resource === PermissionResource.FUNERAL_DIRECTORS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT, PermissionAction.DELETE].includes(p.action)) ||
        (p.resource === PermissionResource.CUSTOMERS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT].includes(p.action)) ||
        (p.resource === PermissionResource.ORDERS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT].includes(p.action)) ||
        (p.resource === PermissionResource.PRODUCTS && [PermissionAction.READ, PermissionAction.CREATE, PermissionAction.EDIT, PermissionAction.DELETE].includes(p.action)) ||
        (p.resource === PermissionResource.REPORTS && PermissionAction.READ === p.action)
    );

    if (retailerRole) {
      retailerRole.permissions = updatedRetailerPermissions;
      retailerRole.description = 'Retailer with access to their own company, staff, funeral directors, and customers';
      await roleRepository.save(retailerRole);
    }
  }
}
