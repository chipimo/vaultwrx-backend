import { Service } from 'typedi';
import { PermissionAction, PermissionResource } from '@api/models/Security/Permission';

export function HasPermission(resource: PermissionResource, action: PermissionAction | PermissionAction[]): any {
  return function (request: any, response: any, next: any) {
    const loggedUser = request.loggedUser;
    
    if (!loggedUser) {
      return response.status(401).send({ status: 401, message: 'Unauthorized!' });
    }

    // Admin has all permissions
    if (loggedUser.role === 'admin' || loggedUser.roleType === 'admin') {
      return next();
    }

    // Check if user has permissions
    const userPermissions = loggedUser.permissions || [];
    const requiredActions = Array.isArray(action) ? action : [action];

    const hasPermission = requiredActions.some((requiredAction) => {
      return userPermissions.some(
        (permission: any) =>
          permission.resource === resource && permission.action === requiredAction
      );
    });

    if (!hasPermission) {
      return response.status(403).send({
        status: 403,
        message: `User does not have permission to ${Array.isArray(action) ? action.join(' or ') : action} ${resource}!`,
      });
    }

    return next();
  };
}

