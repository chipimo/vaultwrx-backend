import { Service } from 'typedi';
import { Request } from 'express';
import { AuditLog, AuditActionType, AuditResourceType } from '@base/api/models/Security-access-control/AuditLog';
import { AuditLogService } from './AuditLogService';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';

export interface ActivityLogOptions {
  action: AuditActionType;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceName?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  isSuccessful?: boolean;
  errorMessage?: string;
}

@Service()
export class AuditService {
  constructor(private auditLogService: AuditLogService) {}

  private getRequestInfo(req: Request): { ipAddress: string; userAgent: string; endpoint: string; method: string } {
    return {
      ipAddress: (req.headers['x-forwarded-for'] as string) || req.ip || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown',
      endpoint: req.originalUrl || req.url || 'unknown',
      method: req.method || 'unknown',
    };
  }

  public async logActivity(
    user: LoggedUserInterface | null,
    companyId: string,
    req: Request,
    options: ActivityLogOptions
  ): Promise<AuditLog> {
    const requestInfo = this.getRequestInfo(req);
    
    return await this.auditLogService.createAuditLog({
      staffId: user?.userId?.toString() || 'anonymous',
      action: options.action,
      resourceType: options.resourceType,
      resourceId: options.resourceId,
      resourceName: options.resourceName,
      description: options.description,
      oldValues: options.oldValues,
      newValues: options.newValues,
      isSuccessful: options.isSuccessful !== false,
      errorMessage: options.errorMessage,
      ...requestInfo,
    });
  }

  public async logCreate(
    user: LoggedUserInterface | null,
    companyId: string,
    req: Request,
    resourceType: AuditResourceType,
    resourceId: string,
    resourceName: string,
    newValues?: any,
    description?: string
  ): Promise<AuditLog> {
    return this.logActivity(user, companyId, req, {
      action: AuditActionType.CREATE,
      resourceType,
      resourceId,
      resourceName,
      newValues,
      description,
      isSuccessful: true,
    });
  }

  public async logView(
    user: LoggedUserInterface | null,
    companyId: string,
    req: Request,
    resourceType: AuditResourceType,
    resourceId: string,
    resourceName: string,
    description?: string
  ): Promise<AuditLog> {
    return this.logActivity(user, companyId, req, {
      action: AuditActionType.VIEW,
      resourceType,
      resourceId,
      resourceName,
      description,
      isSuccessful: true,
    });
  }

  public async logUpdate(
    user: LoggedUserInterface | null,
    companyId: string,
    req: Request,
    resourceType: AuditResourceType,
    resourceId: string,
    resourceName: string,
    oldValues?: any,
    newValues?: any,
    description?: string
  ): Promise<AuditLog> {
    return this.logActivity(user, companyId, req, {
      action: AuditActionType.UPDATE,
      resourceType,
      resourceId,
      resourceName,
      oldValues,
      newValues,
      description,
      isSuccessful: true,
    });
  }

  public async logDelete(
    user: LoggedUserInterface | null,
    companyId: string,
    req: Request,
    resourceType: AuditResourceType,
    resourceId: string,
    resourceName: string,
    oldValues?: any,
    description?: string
  ): Promise<AuditLog> {
    return this.logActivity(user, companyId, req, {
      action: AuditActionType.DELETE,
      resourceType,
      resourceId,
      resourceName,
      oldValues,
      description,
      isSuccessful: true,
    });
  }

  public async getAuditLogsByCompany(
    companyId: string,
    options: any = {}
  ): Promise<{ logs: any[]; total: number }> {
    const result = await this.auditLogService.getAuditLogs(
      {
        staffId: options.employeeId,
        action: options.action ? [options.action] : undefined,
        resourceType: options.resourceType ? [options.resourceType] : undefined,
        resourceId: options.resourceId,
        dateFrom: options.startDate,
        dateTo: options.endDate,
      },
      {
        limit: options.limit,
        page: options.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
      }
    );

    return {
      logs: result.auditLogs,
      total: result.total,
    };
  }

  public async getAuditSummary(
    companyId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalActions: number;
    actionsByType: { [key: string]: number };
    actionsByResource: { [key: string]: number };
    actionsByEmployee: { [key: string]: number };
  }> {
    const stats = await this.auditLogService.getAuditStatistics(startDate, endDate);
    
    const actionsByType: { [key: string]: number } = {};
    stats.mostCommonActions.forEach(item => {
      actionsByType[item.action] = item.count;
    });

    const actionsByResource: { [key: string]: number } = {};
    stats.mostCommonResources.forEach(item => {
      actionsByResource[item.resourceType] = item.count;
    });

    return {
      totalActions: stats.totalActions,
      actionsByType,
      actionsByResource,
      actionsByEmployee: {},
    };
  }

  public async getAuditLogsByResource(
    companyId: string,
    resourceType: AuditResourceType,
    resourceId: string
  ): Promise<any[]> {
    const result = await this.auditLogService.getAuditLogsByResource(resourceType, resourceId);
    return result.auditLogs;
  }

  public async getAuditLogsByEmployee(
    companyId: string,
    employeeId: string,
    options: any = {}
  ): Promise<{ logs: any[]; total: number }> {
    const result = await this.auditLogService.getAuditLogsByStaff(employeeId, {
      limit: options.limit,
      page: options.offset ? Math.floor(options.offset / (options.limit || 20)) + 1 : 1,
    });

    return {
      logs: result.auditLogs,
      total: result.total,
    };
  }
}

