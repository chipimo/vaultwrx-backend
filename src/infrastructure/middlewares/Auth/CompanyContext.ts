import { ExpressMiddlewareInterface } from 'routing-controllers';
import { Service } from 'typedi';
import { Response } from 'express';
import { RoleType } from '@api/models/Security/Role';

/**
 * Middleware to extract and validate companyId from headers
 * Attaches companyId to request object for use in services
 * Validates user has access to the requested company
 */
@Service()
export class CompanyContext implements ExpressMiddlewareInterface {
  use(request: any, response: Response, next?: (err?: any) => any): any {
    const loggedUser = request.loggedUser;
    
    if (!loggedUser) {
      return response.status(401).send({ status: 401, message: 'Unauthorized!' });
    }

    // Get company ID from headers (x-company-id or company-id)
    const companyIdHeader = request.headers['x-company-id'] || request.headers['company-id'];
    const companyId = companyIdHeader ? parseInt(companyIdHeader) : null;

    // If no company ID in header, use the user's company ID (for non-admin users)
    let effectiveCompanyId = companyId;
    
    if (!effectiveCompanyId) {
      // For non-admin users, use their assigned company
      if (loggedUser.roleType !== RoleType.ADMIN) {
        effectiveCompanyId = loggedUser.owned_company_id || loggedUser.company_id;
      }
    }

    // Validate access for non-admin users
    if (loggedUser.roleType !== RoleType.ADMIN && effectiveCompanyId) {
      // Retailer can only access their owned company
      if (loggedUser.roleType === RoleType.RETAILER) {
        const ownedCompanyId = loggedUser.owned_company_id || loggedUser.company_id;
        if (effectiveCompanyId !== ownedCompanyId) {
          return response.status(403).send({
            status: 403,
            message: 'You do not have access to this company',
          });
        }
      } else {
        // Other users (staff, customer, funeral director) can only access their assigned company
        if (effectiveCompanyId !== loggedUser.company_id) {
          return response.status(403).send({
            status: 403,
            message: 'You do not have access to this company',
          });
        }
      }
    }

    // Attach companyId to request for use in services
    request.companyId = effectiveCompanyId;
    
    next();
  }
}

