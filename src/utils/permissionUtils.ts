import { LoggedUserInterface, LoggedUserRole } from '@base/api/interfaces/users/LoggedUserInterface';

/**
 * Check if user has any of the required roles
 */
export function hasRole(user: LoggedUserInterface | null, requiredRoles: string[]): boolean {
  if (!user) {
    return false;
  }

  // Check if user has roles array (new structure)
  if (user.roles && Array.isArray(user.roles)) {
    const userRoleNames = user.roles.map((role: LoggedUserRole) => role.name);
    return requiredRoles.some(requiredRole => userRoleNames.includes(requiredRole));
  }

  // Fallback to old structure (single role)
  if (user.role) {
    return requiredRoles.includes(user.role);
  }

  return false;
}

/**
 * Check if user has any of the required permissions
 */
export function hasPermission(user: LoggedUserInterface | null, requiredPermissions: string[]): boolean {
  if (!user) {
    return false;
  }

  // Check if user has roles array (new structure)
  if (user.roles && Array.isArray(user.roles)) {
    const allPermissions: string[] = [];
    type Perm = { permissionKey: string; allowed: boolean };
    user.roles.forEach((role: LoggedUserRole) => {
      // Add employee permissions
      if (role.employeePermissions && Array.isArray(role.employeePermissions)) {
        role.employeePermissions
          .filter((permission: Perm) => permission.allowed)
          .forEach((permission: Perm) => {
            allPermissions.push(permission.permissionKey);
          });
      }
      
      // Add customer permissions
      if (role.customerPermissions && Array.isArray(role.customerPermissions)) {
        role.customerPermissions
          .filter((permission: Perm) => permission.allowed)
          .forEach((permission: Perm) => {
            allPermissions.push(permission.permissionKey);
          });
      }
    });

    return requiredPermissions.some(requiredPermission => 
      allPermissions.includes(requiredPermission)
    );
  }

  return false;
}

/**
 * Get all permissions for a user
 */
export function getUserPermissions(user: LoggedUserInterface | null): string[] {
  if (!user) {
    return [];
  }

  const allPermissions: string[] = [];

  // Check if user has roles array (new structure)
  if (user.roles && Array.isArray(user.roles)) {
    type Perm = { permissionKey: string; allowed: boolean };
    user.roles.forEach((role: LoggedUserRole) => {
      // Add employee permissions
      if (role.employeePermissions && Array.isArray(role.employeePermissions)) {
        role.employeePermissions
          .filter((permission: Perm) => permission.allowed)
          .forEach((permission: Perm) => {
            allPermissions.push(permission.permissionKey);
          });
      }
      
      // Add customer permissions
      if (role.customerPermissions && Array.isArray(role.customerPermissions)) {
        role.customerPermissions
          .filter((permission: Perm) => permission.allowed)
          .forEach((permission: Perm) => {
            allPermissions.push(permission.permissionKey);
          });
      }
    });
  }

  return allPermissions;
}

/**
 * Get all role names for a user
 */
export function getUserRoles(user: LoggedUserInterface | null): string[] {
  if (!user) {
    return [];
  }

  // Check if user has roles array (new structure)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.map((role: LoggedUserRole) => role.name);
  }

  // Fallback to old structure (single role)
  if (user.role) {
    return [user.role];
  }

  return [];
}

/**
 * Check if user has access to a specific company
 */
export function hasCompanyAccess(user: LoggedUserInterface | null, companyId: string): boolean {
  if (!user) {
    return false;
  }

  // Check if user has roles array (new structure)
  if (user.roles && Array.isArray(user.roles)) {
    return user.roles.some((role: LoggedUserRole) => role.company?.id === companyId);
  }

  // Check if user has companies array
  if (user.companies && Array.isArray(user.companies)) {
    return user.companies.some((company: { id: string }) => company.id === companyId);
  }

  return false;
}
