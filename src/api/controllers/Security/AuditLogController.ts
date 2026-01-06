import { JsonController, Get, Post, Param, QueryParams, CurrentUser, UseBefore, Body } from 'routing-controllers';
import { Service } from 'typedi';
import { AuditLogService, CreateAuditLogRequest, AuditLogFilters, AuditLogListOptions, AuditLogListResponse } from '@base/api/services/Security/AuditLogService';
import { AuditLog } from '@base/api/models/Security-access-control/AuditLog';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { AuthCheck } from '../../infrastructure/middlewares/AuthCheck';

@Service()
@JsonController('/audit-logs')
@UseBefore(AuthCheck)
export class AuditLogController {
  constructor(private auditLogService: AuditLogService) {}

  @Post('/')
  public async createAuditLog(
    @Body() createAuditLogRequest: CreateAuditLogRequest,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLog> {
    return this.auditLogService.createAuditLog(createAuditLogRequest);
  }

  @Get('/:id')
  public async getAuditLogById(
    @Param('id') id: string,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLog> {
    const auditLog = await this.auditLogService.getAuditLogById(id);
    if (!auditLog) {
      throw new Error('Audit log not found');
    }
    return auditLog;
  }

  @Get('/')
  public async getAuditLogs(
    @QueryParams() filters: AuditLogFilters,
    @QueryParams() options: AuditLogListOptions,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLogListResponse> {
    return this.auditLogService.getAuditLogs(filters, options);
  }

  @Get('/staff/:staffId')
  public async getAuditLogsByStaff(
    @Param('staffId') staffId: string,
    @QueryParams() options: AuditLogListOptions,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLogListResponse> {
    return this.auditLogService.getAuditLogsByStaff(staffId, options);
  }

  @Get('/resource/:resourceType/:resourceId')
  public async getAuditLogsByResource(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @QueryParams() options: AuditLogListOptions,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLogListResponse> {
    return this.auditLogService.getAuditLogsByResource(resourceType as any, resourceId, options);
  }

  @Get('/date-range')
  public async getAuditLogsByDateRange(
    @QueryParams() dateFrom: Date,
    @QueryParams() dateTo: Date,
    @QueryParams() options: AuditLogListOptions,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLogListResponse> {
    return this.auditLogService.getAuditLogsByDateRange(dateFrom, dateTo, options);
  }

  @Get('/failed')
  public async getFailedAuditLogs(
    @QueryParams() options: AuditLogListOptions,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLogListResponse> {
    return this.auditLogService.getFailedAuditLogs(options);
  }

  @Get('/ip/:ipAddress')
  public async getAuditLogsByIP(
    @Param('ipAddress') ipAddress: string,
    @QueryParams() options: AuditLogListOptions,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLogListResponse> {
    return this.auditLogService.getAuditLogsByIP(ipAddress, options);
  }

  @Get('/statistics/overview')
  public async getAuditStatistics(
    @QueryParams() dateFrom: Date,
    @QueryParams() dateTo: Date,
    @QueryParams() staffId: string,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<any> {
    return this.auditLogService.getAuditStatistics(dateFrom, dateTo, staffId);
  }

  @Get('/staff/:staffId/activity')
  public async getStaffActivitySummary(
    @Param('staffId') staffId: string,
    @QueryParams() days: number,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<any> {
    return this.auditLogService.getStaffActivitySummary(staffId, days);
  }

  @Get('/resource/:resourceType/:resourceId/trail')
  public async getResourceAuditTrail(
    @Param('resourceType') resourceType: string,
    @Param('resourceId') resourceId: string,
    @CurrentUser() user: LoggedUserInterface
  ): Promise<AuditLog[]> {
    return this.auditLogService.getResourceAuditTrail(resourceType as any, resourceId);
  }
}
