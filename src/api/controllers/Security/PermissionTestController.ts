import { JsonController, Get, Authorized, CurrentUser, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { hasRole, hasPermission, getUserRoles, getUserPermissions } from '@base/utils/permissionUtils';

@Service()
@JsonController('/permission-test')
export class PermissionTestController {
  
  /**
   * Debug endpoint to check authentication status
   */
  @Get('/debug-auth')
  public async debugAuth(@Req() request: any, @CurrentUser() user: LoggedUserInterface | null) {
    const authHeader = request.headers.authorization;
    const token = authHeader ? authHeader.split(' ')[1] : null;
    
    return {
      success: true,
      debug: {
        hasAuthHeader: !!authHeader,
        hasToken: !!token,
        tokenLength: token ? token.length : 0,
        user: user ? {
          userId: user.userId,
          email: user.email,
          hasRoles: !!user.roles,
          rolesCount: user.roles ? user.roles.length : 0,
          roleNames: user.roles ? user.roles.map(r => r.name) : [],
          primaryRole: user.role
        } : null,
        headers: {
          authorization: authHeader ? 'Bearer [TOKEN]' : 'Not found',
          'company-id': request.headers['company-id'] || 'Not found'
        }
      }
    };
  }
  
  /**
   * Test endpoint to check user roles and permissions
   */
  @Authorized(['admin', 'owner', 'manager', 'hr', 'employee'])
  @Get('/my-permissions')
  public async getMyPermissions(@CurrentUser() user: LoggedUserInterface | null) {
    if (!user) {
      return {
        success: false,
        message: 'User not authenticated'
      };
    }

    const userRoles = getUserRoles(user);
    const userPermissions = getUserPermissions(user);
    const hasAdminRole = hasRole(user, ['admin', 'owner']);
    const hasEmployeePermission = hasPermission(user, ['CAN_VIEW_OWN_RECORDS']);

    return {
      success: true,
      user: {
        userId: user.userId,
        email: user.email,
        roles: userRoles,
        permissions: userPermissions,
        hasAdminRole,
        hasEmployeePermission,
        fullRoles: user.roles || []
      }
    };
  }

  /**
   * Test endpoint that requires specific permissions
   */
  @Authorized(['CAN_MANAGE_EMPLOYEES', 'CAN_VIEW_EMPLOYEE_RECORDS'])
  @Get('/employee-management')
  public async employeeManagement(@CurrentUser() user: LoggedUserInterface | null) {
    return {
      success: true,
      message: 'You have access to employee management',
      user: {
        userId: user?.userId,
        email: user?.email,
        roles: getUserRoles(user),
        permissions: getUserPermissions(user)
      }
    };
  }

  /**
   * Test endpoint that requires admin role
   */
  @Authorized(['admin', 'owner'])
  @Get('/admin-only')
  public async adminOnly(@CurrentUser() user: LoggedUserInterface | null) {
    return {
      success: true,
      message: 'You have admin access',
      user: {
        userId: user?.userId,
        email: user?.email,
        roles: getUserRoles(user)
      }
    };
  }
}
