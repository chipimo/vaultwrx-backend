import { Service } from 'typedi';
import { AuditLogRepository } from '@api/repositories/Audit/AuditLogRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { AuditLog, AuditAction, AuditResource } from '@api/models/Audit/AuditLog';

export interface AuditLogData {
  companyId: string;
  userId: string;
  userEmail: string;
  userName: string;
  userRole: string;
  action: AuditAction;
  resource: AuditResource;
  resourceId?: string;
  description?: string;
  ipAddress?: string;
  userAgent?: string;
  oldValues?: any;
  newValues?: any;
}

@Service()
export class AuditLogService {
  constructor(
    @InjectRepository() private auditLogRepository: AuditLogRepository
  ) {}

  public async getAll(resourceOptions?: any, companyId?: string) {
    return await this.auditLogRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.auditLogRepository.getOneById(id, resourceOptions, companyId);
  }

  public async createAuditLog(data: AuditLogData): Promise<AuditLog> {
    const auditLog = new AuditLog();
    
    auditLog.companyId = data.companyId;
    auditLog.userId = data.userId;
    auditLog.userEmail = data.userEmail;
    auditLog.userName = data.userName;
    auditLog.userRole = data.userRole;
    auditLog.action = data.action;
    auditLog.resource = data.resource;
    auditLog.resourceId = data.resourceId;
    auditLog.description = data.description;
    auditLog.ipAddress = data.ipAddress;
    auditLog.userAgent = data.userAgent;
    auditLog.oldValues = data.oldValues;
    auditLog.newValues = data.newValues;

    return await this.auditLogRepository.save(auditLog);
  }

  public async logOrderAction(
    companyId: string,
    user: any,
    action: AuditAction,
    orderId: string,
    description?: string,
    oldValues?: any,
    newValues?: any,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuditLog> {
    return await this.createAuditLog({
      companyId,
      userId: user.userId || user.id,
      userEmail: user.email || '',
      userName: user.full_name || `${user.first_name || ''} ${user.last_name || ''}`.trim() || 'Unknown',
      userRole: user.role || user.roleType || 'Unknown',
      action,
      resource: AuditResource.ORDER,
      resourceId: orderId,
      description,
      ipAddress,
      userAgent,
      oldValues,
      newValues,
    });
  }
}

