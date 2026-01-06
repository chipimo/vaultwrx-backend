import { 
  JsonController, 
  Get, 
  QueryParam, 
  Param, 
  Req, 
  Authorized,
  CurrentUser
} from 'routing-controllers';
import { Service } from 'typedi';
import { Request } from 'express';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { AuditService } from '@base/api/services/Security/AuditService';
import { AuditActionType, AuditResourceType } from '@base/api/models/Security-access-control/AuditLog';

@Service()
@JsonController('/audit-logs')
export class AuditController {
  constructor(private auditService: AuditService) {}

  @Authorized(['admin', 'manager'])
  @Get('/')
  public async getAuditLogs(
    @Req() req: Request,
    @CurrentUser() user: LoggedUserInterface | null,
    @QueryParam('employeeId') employeeId?: string,
    @QueryParam('action') action?: AuditActionType,
    @QueryParam('resourceType') resourceType?: AuditResourceType,
    @QueryParam('resourceId') resourceId?: string,
    @QueryParam('startDate') startDate?: string,
    @QueryParam('endDate') endDate?: string,
    @QueryParam('limit') limit?: number,
    @QueryParam('offset') offset?: number
  ): Promise<{ logs: any[]; total: number }> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    const options: any = {};
    if (employeeId) options.employeeId = employeeId;
    if (action) options.action = action;
    if (resourceType) options.resourceType = resourceType;
    if (resourceId) options.resourceId = resourceId;
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (limit) options.limit = limit;
    if (offset) options.offset = offset;

    return this.auditService.getAuditLogsByCompany(companyId, options);
  }

  @Authorized(['admin', 'manager'])
  @Get('/summary')
  public async getAuditSummary(
    @Req() req: Request,
    @CurrentUser() user: LoggedUserInterface | null,
    @QueryParam('startDate') startDate?: string,
    @QueryParam('endDate') endDate?: string
  ): Promise<{
    totalActions: number;
    actionsByType: { [key: string]: number };
    actionsByResource: { [key: string]: number };
    actionsByEmployee: { [key: string]: number };
  }> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    const options: any = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);

    return this.auditService.getAuditSummary(companyId, options.startDate, options.endDate);
  }

  @Authorized(['admin', 'manager'])
  @Get('/resource/:resourceType/:resourceId')
  public async getAuditLogsByResource(
    @Req() req: Request,
    @CurrentUser() user: LoggedUserInterface | null,
    @Param('resourceType') resourceType: AuditResourceType,
    @Param('resourceId') resourceId: string
  ): Promise<any[]> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    return this.auditService.getAuditLogsByResource(companyId, resourceType, resourceId);
  }

  @Authorized(['admin', 'manager'])
  @Get('/employee/:employeeId')
  public async getAuditLogsByEmployee(
    @Req() req: Request,
    @CurrentUser() user: LoggedUserInterface | null,
    @Param('employeeId') employeeId: string,
    @QueryParam('startDate') startDate?: string,
    @QueryParam('endDate') endDate?: string,
    @QueryParam('limit') limit?: number,
    @QueryParam('offset') offset?: number
  ): Promise<{ logs: any[]; total: number }> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    const options: any = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (limit) options.limit = limit;
    if (offset) options.offset = offset;

    return this.auditService.getAuditLogsByEmployee(companyId, employeeId, options);
  }

  @Authorized(['admin', 'manager'])
  @Get('/my-activity')
  public async getMyAuditLogs(
    @Req() req: Request,
    @CurrentUser() user: LoggedUserInterface | null,
    @QueryParam('startDate') startDate?: string,
    @QueryParam('endDate') endDate?: string,
    @QueryParam('limit') limit?: number,
    @QueryParam('offset') offset?: number
  ): Promise<{ logs: any[]; total: number }> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    if (!user) {
      throw new Error('User not authenticated');
    }

    const options: any = {};
    if (startDate) options.startDate = new Date(startDate);
    if (endDate) options.endDate = new Date(endDate);
    if (limit) options.limit = limit;
    if (offset) options.offset = offset;

    return this.auditService.getAuditLogsByEmployee(companyId, user.userId.toString(), options);
  }
}
