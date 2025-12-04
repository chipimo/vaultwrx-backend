import { RoleType } from '@api/models/Security/Role';

export function HasRoleType(roleType: RoleType | RoleType[]): any {
  return function (request: any, response: any, next: any) {
    const loggedUser = request.loggedUser;
    
    if (!loggedUser) {
      return response.status(401).send({ status: 401, message: 'Unauthorized!' });
    }

    const userRoleType = loggedUser.roleType || loggedUser.role?.type;
    const requiredRoleTypes = Array.isArray(roleType) ? roleType : [roleType];

    if (!requiredRoleTypes.includes(userRoleType)) {
      return response.status(403).send({
        status: 403,
        message: `User does not have the required role type! Required: ${requiredRoleTypes.join(' or ')}, Current: ${userRoleType}`,
      });
    }

    return next();
  };
}

