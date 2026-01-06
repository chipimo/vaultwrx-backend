import { createParamDecorator } from 'routing-controllers';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { PermissionService } from '@base/api/services/Security/PermissionService';
import { Container } from 'typedi';
import { ForbiddenError } from '@base/api/exceptions/Application/ApplicationException';

export function RequirePermission(permissionKey: string) {
  return createParamDecorator({
    required: true,
    value: async (action) => {
      const user = action.request.loggedUser as LoggedUserInterface;
      
      if (!user) {
        throw new ForbiddenError('User not authenticated');
      }

      const permissionService = Container.get(PermissionService);
      
      const hasPermission = await permissionService.hasPermission(
        user.userId,
        user.userType || 'employee',
        permissionKey,
        user.companyId || user.companies?.[0]?.id
      );

      if (!hasPermission.hasPermission) {
        throw new ForbiddenError(hasPermission.reason || `Insufficient permissions: ${permissionKey}`);
      }

      return true;
    },
  });
}

export function RequireAnyPermission(permissionKeys: string[]) {
  return createParamDecorator({
    required: true,
    value: async (action) => {
      const user = action.request.loggedUser as LoggedUserInterface;
      
      if (!user) {
        throw new ForbiddenError('User not authenticated');
      }

      const permissionService = Container.get(PermissionService);
      
      const hasPermission = await permissionService.hasAnyPermission(
        user.userId,
        user.userType || 'employee',
        permissionKeys,
        user.companyId || user.companies?.[0]?.id
      );

      if (!hasPermission.hasPermission) {
        throw new ForbiddenError(hasPermission.reason || `Insufficient permissions: ${permissionKeys.join(', ')}`);
      }

      return true;
    },
  });
}

export function RequireRole(roleName: string) {
  return createParamDecorator({
    required: true,
    value: async (action) => {
      const user = action.request.loggedUser as LoggedUserInterface;
      
      if (!user) {
        throw new ForbiddenError('User not authenticated');
      }

      const permissionService = Container.get(PermissionService);
      
      const hasRole = await permissionService.hasRole(
        user.userId,
        user.userType || 'employee',
        roleName,
        user.companyId || user.companies?.[0]?.id
      );

      if (!hasRole) {
        throw new ForbiddenError(`Insufficient role: ${roleName}`);
      }

      return true;
    },
  });
}

export function RequireAnyRole(roleNames: string[]) {
  return createParamDecorator({
    required: true,
    value: async (action) => {
      const user = action.request.loggedUser as LoggedUserInterface;
      
      if (!user) {
        throw new ForbiddenError('User not authenticated');
      }

      const permissionService = Container.get(PermissionService);
      
      const hasRole = await permissionService.hasAnyRole(
        user.userId,
        user.userType || 'employee',
        roleNames,
        user.companyId || user.companies?.[0]?.id
      );

      if (!hasRole) {
        throw new ForbiddenError(`Insufficient role: ${roleNames.join(', ')}`);
      }

      return true;
    },
  });
}
