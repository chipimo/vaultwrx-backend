import { Service } from 'typedi';
import { AuditLog, AuditActionType, AuditResourceType } from '@base/api/models/Security-access-control/AuditLog';
import { AuditLogRepository } from '@base/api/repositories/Security/AuditLogRepository';
import { Staff } from '@base/api/models/Store-employee-management/Staff';

export interface CreateAuditLogRequest {
  staffId: string;
  action: AuditActionType;
  resourceType: AuditResourceType;
  resourceId?: string;
  resourceName?: string;
  description?: string;
  oldValues?: any;
  newValues?: any;
  ipAddress?: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  requestId?: string;
  isSuccessful?: boolean;
  errorMessage?: string;
  responseTime?: number;
}

export interface AuditLogFilters {
  staffId?: string;
  action?: AuditActionType[];
  resourceType?: AuditResourceType[];
  resourceId?: string;
  dateFrom?: Date;
  dateTo?: Date;
  isSuccessful?: boolean;
  ipAddress?: string;
}

export interface AuditLogListOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
  includeStaff?: boolean;
}

export interface AuditLogListResponse {
  auditLogs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Service()
export class AuditLogService {
  constructor(private auditLogRepository: AuditLogRepository) {}

  public async createAuditLog(auditLogData: CreateAuditLogRequest): Promise<AuditLog> {
    const auditLog = this.auditLogRepository.create({
      ...auditLogData,
      createdAt: new Date(),
    });

    return await this.auditLogRepository.save(auditLog);
  }

  public async getAuditLogs(
    filters: AuditLogFilters = {},
    options: AuditLogListOptions = {}
  ): Promise<AuditLogListResponse> {
    const result = await this.auditLogRepository.getAuditLogsWithFilters(filters, options);

    return {
      auditLogs: result.auditLogs,
      total: result.total,
      page: options.page || 1,
      limit: options.limit || 20,
      totalPages: Math.ceil(result.total / (options.limit || 20))
    };
  }

  public async getAuditLogById(id: string): Promise<AuditLog | null> {
    return await this.auditLogRepository.getAuditLogById(id);
  }

  public async getAuditLogsByStaff(staffId: string, options: AuditLogListOptions = {}): Promise<AuditLogListResponse> {
    return await this.getAuditLogs({ staffId }, options);
  }

  public async getAuditLogsByResource(
    resourceType: AuditResourceType,
    resourceId: string,
    options: AuditLogListOptions = {}
  ): Promise<AuditLogListResponse> {
    return await this.getAuditLogs({ resourceType: [resourceType], resourceId }, options);
  }

  public async getAuditLogsByDateRange(
    dateFrom: Date,
    dateTo: Date,
    options: AuditLogListOptions = {}
  ): Promise<AuditLogListResponse> {
    return await this.getAuditLogs({ dateFrom, dateTo }, options);
  }

  public async getFailedAuditLogs(options: AuditLogListOptions = {}): Promise<AuditLogListResponse> {
    return await this.getAuditLogs({ isSuccessful: false }, options);
  }

  public async getAuditLogsByIP(ipAddress: string, options: AuditLogListOptions = {}): Promise<AuditLogListResponse> {
    return await this.getAuditLogs({ ipAddress }, options);
  }

  public async getAuditStatistics(
    dateFrom?: Date,
    dateTo?: Date,
    staffId?: string
  ): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    uniqueStaff: number;
    mostCommonActions: Array<{ action: string; count: number }>;
    mostCommonResources: Array<{ resourceType: string; count: number }>;
    averageResponseTime: number;
  }> {
    return await this.auditLogRepository.getAuditStatistics(dateFrom, dateTo, staffId);
  }

  public async getStaffActivitySummary(staffId: string, days: number = 30): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    mostActiveHours: Array<{ hour: number; count: number }>;
    mostCommonActions: Array<{ action: string; count: number }>;
    averageResponseTime: number;
  }> {
    return await this.auditLogRepository.getStaffActivitySummary(staffId, days);
  }

  public async getResourceAuditTrail(
    resourceType: AuditResourceType,
    resourceId: string
  ): Promise<AuditLog[]> {
    return await this.auditLogRepository.getResourceAuditTrail(resourceType, resourceId);
  }

  public async getHumanReadableDescription(auditLog: AuditLog): Promise<string> {
    const actionMap = {
      [AuditActionType.CREATE]: 'created',
      [AuditActionType.UPDATE]: 'updated',
      [AuditActionType.DELETE]: 'deleted',
      [AuditActionType.LOGIN]: 'logged in',
      [AuditActionType.LOGOUT]: 'logged out',
      [AuditActionType.VIEW]: 'viewed',
      [AuditActionType.EXPORT]: 'exported',
      [AuditActionType.IMPORT]: 'imported',
      [AuditActionType.APPROVE]: 'approved',
      [AuditActionType.REJECT]: 'rejected',
      [AuditActionType.ASSIGN]: 'assigned',
      [AuditActionType.TRANSFER]: 'transferred',
      [AuditActionType.DOWNLOAD]: 'downloaded',
      [AuditActionType.UPLOAD]: 'uploaded',
      [AuditActionType.PRINT]: 'printed',
      [AuditActionType.EMAIL]: 'sent email',
      [AuditActionType.SMS]: 'sent SMS',
      [AuditActionType.NOTIFICATION]: 'sent notification',
      [AuditActionType.SETTING_CHANGE]: 'changed settings',
      [AuditActionType.PERMISSION_CHANGE]: 'changed permissions',
      [AuditActionType.ROLE_CHANGE]: 'changed role',
      [AuditActionType.PASSWORD_CHANGE]: 'changed password',
      [AuditActionType.PROFILE_UPDATE]: 'updated profile',
      [AuditActionType.SYSTEM_ACTION]: 'performed system action',
    };

    const resourceMap = {
      [AuditResourceType.BUDGET_ENTRY]: 'budget entry',
      [AuditResourceType.BUDGET_CATEGORY]: 'budget category',
      [AuditResourceType.BUDGET_ALLOCATION]: 'budget allocation',
      [AuditResourceType.EMPLOYEE]: 'employee',
      [AuditResourceType.CUSTOMER]: 'customer',
      [AuditResourceType.PRODUCT]: 'product',
      [AuditResourceType.INVENTORY]: 'inventory',
      [AuditResourceType.ORDER]: 'order',
      [AuditResourceType.PAYMENT]: 'payment',
      [AuditResourceType.INVOICE]: 'invoice',
      [AuditResourceType.COMPANY]: 'company',
      [AuditResourceType.BRANCH]: 'branch',
      [AuditResourceType.DEPARTMENT]: 'department',
      [AuditResourceType.ROLE]: 'role',
      [AuditResourceType.PERMISSION]: 'permission',
      [AuditResourceType.SETTING]: 'setting',
      [AuditResourceType.REPORT]: 'report',
      [AuditResourceType.DOCUMENT]: 'document',
      [AuditResourceType.ASSET]: 'asset',
      [AuditResourceType.BANK_ACCOUNT]: 'bank account',
      [AuditResourceType.TAX]: 'tax',
      [AuditResourceType.DISCOUNT]: 'discount',
      [AuditResourceType.REFUND]: 'refund',
      [AuditResourceType.SUBSCRIPTION]: 'subscription',
      [AuditResourceType.NOTIFICATION]: 'notification',
      [AuditResourceType.SYSTEM]: 'system',
    };

    const action = actionMap[auditLog.action] || auditLog.action.toLowerCase();
    const resource = resourceMap[auditLog.resourceType] || auditLog.resourceType.toLowerCase();
    
    if (auditLog.resourceName) {
      return `${auditLog.staff?.firstName || 'User'} ${action} ${resource}: ${auditLog.resourceName}`;
    }
    
    return `${auditLog.staff?.firstName || 'User'} ${action} ${resource}`;
  }
}
