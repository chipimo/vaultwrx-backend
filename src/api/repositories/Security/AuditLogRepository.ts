import { Repository, SelectQueryBuilder, Between, In, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Service } from 'typedi';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { AuditLog, AuditActionType, AuditResourceType } from '@base/api/models/Security-access-control/AuditLog';
import { AuditLogFilters, AuditLogListOptions } from '@base/api/services/Security/AuditLogService';

@Service()
export class AuditLogRepository extends RepositoryBase<AuditLog> {
  constructor() {
    super();
  }

  public async getAuditLogsWithFilters(
    filters: AuditLogFilters = {},
    options: AuditLogListOptions = {}
  ): Promise<{ auditLogs: AuditLog[]; total: number; page: number; limit: number }> {
    const {
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
      includeStaff = true,
    } = options;

    const queryBuilder = this.createQueryBuilder('auditLog');

    this.applyFilters(queryBuilder, filters);
    this.applyIncludes(queryBuilder, options);

    queryBuilder.orderBy(`auditLog.${sortBy}`, sortOrder);

    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    const [auditLogs, total] = await queryBuilder.getManyAndCount();

    return {
      auditLogs,
      total,
      page,
      limit
    };
  }

  public async getAuditLogById(id: string): Promise<AuditLog | null> {
    return await this.findOne({ 
      where: { id },
      relations: ['staff']
    });
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
    const queryBuilder = this.createQueryBuilder('auditLog');

    if (dateFrom) {
      queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', { dateFrom });
    }
    if (dateTo) {
      queryBuilder.andWhere('auditLog.createdAt <= :dateTo', { dateTo });
    }
    if (staffId) {
      queryBuilder.andWhere('auditLog.staffId = :staffId', { staffId });
    }

    const totalActions = await queryBuilder.getCount();

    const successfulActions = await queryBuilder
      .clone()
      .andWhere('auditLog.isSuccessful = :isSuccessful', { isSuccessful: true })
      .getCount();

    const failedActions = totalActions - successfulActions;

    const uniqueStaff = await queryBuilder
      .clone()
      .select('COUNT(DISTINCT auditLog.staffId)', 'uniqueStaff')
      .getRawOne()
      .then(result => parseInt(result.uniqueStaff) || 0);

    const mostCommonActions = await queryBuilder
      .clone()
      .select('auditLog.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const mostCommonResources = await queryBuilder
      .clone()
      .select('auditLog.resourceType', 'resourceType')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.resourceType')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const averageResponseTime = await queryBuilder
      .clone()
      .select('AVG(auditLog.responseTime)', 'avgResponseTime')
      .where('auditLog.responseTime IS NOT NULL')
      .getRawOne()
      .then(result => parseFloat(result.avgResponseTime) || 0);

    return {
      totalActions,
      successfulActions,
      failedActions,
      uniqueStaff,
      mostCommonActions,
      mostCommonResources,
      averageResponseTime
    };
  }

  public async getStaffActivitySummary(
    staffId: string,
    days: number = 30
  ): Promise<{
    totalActions: number;
    successfulActions: number;
    failedActions: number;
    mostActiveHours: Array<{ hour: number; count: number }>;
    mostCommonActions: Array<{ action: string; count: number }>;
    averageResponseTime: number;
  }> {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const queryBuilder = this.createQueryBuilder('auditLog')
      .where('auditLog.staffId = :staffId', { staffId })
      .andWhere('auditLog.createdAt >= :dateFrom', { dateFrom });

    const totalActions = await queryBuilder.getCount();

    const successfulActions = await queryBuilder
      .clone()
      .andWhere('auditLog.isSuccessful = :isSuccessful', { isSuccessful: true })
      .getCount();

    const failedActions = totalActions - successfulActions;

    const mostActiveHours = await queryBuilder
      .clone()
      .select('EXTRACT(HOUR FROM auditLog.createdAt)', 'hour')
      .addSelect('COUNT(*)', 'count')
      .groupBy('EXTRACT(HOUR FROM auditLog.createdAt)')
      .orderBy('count', 'DESC')
      .limit(24)
      .getRawMany();

    const mostCommonActions = await queryBuilder
      .clone()
      .select('auditLog.action', 'action')
      .addSelect('COUNT(*)', 'count')
      .groupBy('auditLog.action')
      .orderBy('count', 'DESC')
      .limit(10)
      .getRawMany();

    const averageResponseTime = await queryBuilder
      .clone()
      .select('AVG(auditLog.responseTime)', 'avgResponseTime')
      .where('auditLog.responseTime IS NOT NULL')
      .getRawOne()
      .then(result => parseFloat(result.avgResponseTime) || 0);

    return {
      totalActions,
      successfulActions,
      failedActions,
      mostActiveHours,
      mostCommonActions,
      averageResponseTime
    };
  }

  public async getResourceAuditTrail(
    resourceType: AuditResourceType,
    resourceId: string
  ): Promise<AuditLog[]> {
    return await this.find({
      where: {
        resourceType,
        resourceId
      },
      relations: ['staff'],
      order: {
        createdAt: 'DESC'
      }
    });
  }

  private applyFilters(queryBuilder: SelectQueryBuilder<AuditLog>, filters: AuditLogFilters): void {
    if (filters.staffId) {
      queryBuilder.andWhere('auditLog.staffId = :staffId', { staffId: filters.staffId });
    }
    if (filters.action && filters.action.length > 0) {
      queryBuilder.andWhere('auditLog.action IN (:...action)', { action: filters.action });
    }
    if (filters.resourceType && filters.resourceType.length > 0) {
      queryBuilder.andWhere('auditLog.resourceType IN (:...resourceType)', { resourceType: filters.resourceType });
    }
    if (filters.resourceId) {
      queryBuilder.andWhere('auditLog.resourceId = :resourceId', { resourceId: filters.resourceId });
    }
    if (filters.dateFrom) {
      queryBuilder.andWhere('auditLog.createdAt >= :dateFrom', { dateFrom: filters.dateFrom });
    }
    if (filters.dateTo) {
      queryBuilder.andWhere('auditLog.createdAt <= :dateTo', { dateTo: filters.dateTo });
    }
    if (filters.isSuccessful !== undefined) {
      queryBuilder.andWhere('auditLog.isSuccessful = :isSuccessful', { isSuccessful: filters.isSuccessful });
    }
    if (filters.ipAddress) {
      queryBuilder.andWhere('auditLog.ipAddress = :ipAddress', { ipAddress: filters.ipAddress });
    }
  }

  private applyIncludes(queryBuilder: SelectQueryBuilder<AuditLog>, options: AuditLogListOptions): void {
    if (options.includeStaff) {
      queryBuilder.leftJoinAndSelect('auditLog.staff', 'staff');
    }
  }
}