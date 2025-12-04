import { Service } from 'typedi';
import { RoleType } from '@api/models/Security/Role';

/**
 * Middleware to ensure user has access to a specific company
 * Admins can access all companies
 * Retailers can only access their owned company
 * Other users can only access their assigned company
 */
export function RequireCompany(companyIdParam: string = 'companyId'): any {
  return function (request: any, response: any, next: any) {
    const loggedUser = request.loggedUser;
    
    if (!loggedUser) {
      return response.status(401).send({ status: 401, message: 'Unauthorized!' });
    }

    // Admin can access all companies
    if (loggedUser.roleType === RoleType.ADMIN) {
      return next();
    }

    // Get the company ID from request params or body
    const requestedCompanyId = request.params[companyIdParam] || request.body?.company_id || request.query?.company_id;
    
    if (!requestedCompanyId) {
      return response.status(400).send({
        status: 400,
        message: 'Company ID is required',
      });
    }

    // Retailer can only access their owned company
    if (loggedUser.roleType === RoleType.RETAILER) {
      const ownedCompanyId = loggedUser.owned_company_id || loggedUser.company_id;
      if (parseInt(requestedCompanyId) !== ownedCompanyId) {
        return response.status(403).send({
          status: 403,
          message: 'You do not have access to this company',
        });
      }
      return next();
    }

    // Other users (staff, customer, funeral director) can only access their assigned company
    if (parseInt(requestedCompanyId) !== loggedUser.company_id) {
      return response.status(403).send({
        status: 403,
        message: 'You do not have access to this company',
      });
    }

    return next();
  };
}

