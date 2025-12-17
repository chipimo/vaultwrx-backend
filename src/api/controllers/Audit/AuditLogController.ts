import { Param, Get, JsonController, UseBefore, QueryParams, Req, OnUndefined } from 'routing-controllers';
import { AuditLogService } from '@api/services/Audit/AuditLogService';
import { Service } from 'typedi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { NotFoundError, ForbiddenError } from 'routing-controllers';
import { LoggedUser } from '@base/decorators/LoggedUser';
import { AuditLog } from '@api/models/Audit/AuditLog';
import { RoleType } from '@api/models/Security/Role';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }], // Add security definition for Swagger
})
@JsonController('/audit-logs')
@UseBefore(AuthCheck)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Get()
  public async getAll(
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<{ total_data: number; rows: AuditLog[] }> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access audit logs from this company.');
      }
    }

    const resourceOptions = parseResourceOptions.getAll();
    return await this.auditLogService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  @OnUndefined(NotFoundError)
  public async getOne(
    @Param('id') id: string,
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<AuditLog> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];

    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }

    if (!user) {
      throw new NotFoundError('Authentication required.');
    }

    // Ensure user belongs to the company
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access audit logs from this company.');
      }
    }

    const resourceOptions = parseResourceOptions.getAll();
    const auditLog = await this.auditLogService.findOneById(id, resourceOptions, companyId);

    if (!auditLog) {
      throw new NotFoundError('Audit log not found.');
    }

    if (auditLog.companyId !== companyId) {
      throw new ForbiddenError('Audit log does not belong to the specified company.');
    }

    return auditLog;
  }
}

