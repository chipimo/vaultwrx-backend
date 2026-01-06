import { Action } from 'routing-controllers';
import jwt from 'jsonwebtoken';
import { authConfig } from '@base/config/auth';

export async function authorizationChecker(action: Action, requiredRolesOrPermissions: string[]): Promise<boolean> {
  const token = action.request.headers.authorization?.split(' ')[1];

  if (!token) {
    return false; // No token, deny access
  }

  try {
    const jwtSecret = authConfig.providers.jwt.secret;
    const user = jwt.verify(token, jwtSecret) as any;

    // Attach user to request for later use
    action.request.loggedUser = user;

    // Check if user has roles array (new structure)
    if (user.roles && Array.isArray(user.roles)) {
      // Extract all permissions from all roles
      const allPermissions: string[] = [];
      const allRoleNames: string[] = [];

      user.roles.forEach((role: any) => {
        allRoleNames.push(role.name);
        
        // Add employee permissions
        if (role.employeePermissions && Array.isArray(role.employeePermissions)) {
          role.employeePermissions
            .filter((permission: any) => permission.allowed)
            .forEach((permission: any) => {
              allPermissions.push(permission.permissionKey);
            });
        }
        
        // Add customer permissions
        if (role.customerPermissions && Array.isArray(role.customerPermissions)) {
          role.customerPermissions
            .filter((permission: any) => permission.allowed)
            .forEach((permission: any) => {
              allPermissions.push(permission.permissionKey);
            });
        }
      });

      // Check if the required role exists in any of the user's roles
      const hasRequiredRole = requiredRolesOrPermissions.some((required) => 
        allRoleNames.includes(required)
      );

      // Check if user has any of the required permissions
      const hasRequiredPermission = requiredRolesOrPermissions.some((required) => 
        allPermissions.includes(required)
      );

      return hasRequiredRole || hasRequiredPermission;
    }

    // Fallback to old structure (single role)
    if (user.role && user.role.employeePermissions) {
      // Extract permissions
      const userPermissions = user.role.employeePermissions
        .filter((permission: any) => permission.allowed)
        .map((permission: any) => permission.permissionKey);

      // Check if the required role exists
      const hasRequiredRole = requiredRolesOrPermissions.some((required) => user.role.name === required);

      // Check if user has any of the required permissions
      const hasRequiredPermission = requiredRolesOrPermissions.some((required) => userPermissions.includes(required));

      return hasRequiredRole || hasRequiredPermission;
    }

    return false; // No roles or permissions found
  } catch (error) {
    return false; // Token verification failed
  }
}