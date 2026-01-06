import { JsonController, Get, QueryParam, Authorized, CurrentUser, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { CustomerReportsService } from '@base/api/services/Customer/CustomerReportsService';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@OpenAPI({
  tags: ['Customer Reports & Analytics'],
  description: 'Customer analytics and reporting endpoints',
})
@JsonController('/customers/reports')
export class CustomerReportsController {
  constructor(private customerReportsService: CustomerReportsService) {}

  /**
   * 🔹 Get customer overview dashboard
   */
  @Get('/dashboard')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getDashboard(
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    totalCustomers: number;
    newCustomersThisMonth: number;
    activeCustomers: number;
    topCustomers: any[];
    customerGrowth: any[];
    loyaltyDistribution: any[];
  }> {
    const companyId = request.headers['company-id'];
    return this.customerReportsService.getDashboard(companyId);
  }

  /**
   * 🔹 Get customer growth report
   */
  @Get('/growth')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomerGrowth(
    @QueryParam('startDate') startDate: string,
    @QueryParam('endDate') endDate: string,
    @QueryParam('period') period: 'daily' | 'weekly' | 'monthly' = 'monthly',
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    period: string;
    data: any[];
    totalGrowth: number;
    averageGrowth: number;
  }> {
    const companyId = request.headers['company-id'];
    return this.customerReportsService.getCustomerGrowth(
      companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined,
      period
    );
  }

  /**
   * 🔹 Get customer segmentation report
   */
  @Get('/segmentation')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomerSegmentation(
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    byType: any[];
    byLoyaltyTier: any[];
    byActivity: any[];
    byLocation: any[];
  }> {
    const companyId = request.headers['company-id'];
    return this.customerReportsService.getCustomerSegmentation(companyId);
  }

  /**
   * 🔹 Get customer lifetime value report
   */
  @Get('/lifetime-value')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomerLifetimeValue(
    @QueryParam('segmentBy') segmentBy: 'tier' | 'type' | 'activity' = 'tier',
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    averageLTV: number;
    medianLTV: number;
    segments: any[];
    topCustomers: any[];
  }> {
    const companyId = request.headers['company-id'];
    return this.customerReportsService.getCustomerLifetimeValue(companyId, segmentBy);
  }

  /**
   * 🔹 Get customer retention report
   */
  @Get('/retention')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomerRetention(
    @QueryParam('period') period: 'monthly' | 'quarterly' | 'yearly' = 'monthly',
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    retentionRate: number;
    churnRate: number;
    cohorts: any[];
    trends: any[];
  }> {
    const companyId = request.headers['company-id'];
    return this.customerReportsService.getCustomerRetention(companyId, period);
  }

  /**
   * 🔹 Get customer activity report
   */
  @Get('/activity')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomerActivity(
    @QueryParam('startDate') startDate: string,
    @QueryParam('endDate') endDate: string,
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    totalActivities: number;
    activitiesByType: any[];
    mostActiveCustomers: any[];
    activityTrends: any[];
  }> {
    const companyId = request.headers['company-id'];
    return this.customerReportsService.getCustomerActivity(
      companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  /**
   * 🔹 Get customer satisfaction report
   */
  @Get('/satisfaction')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomerSatisfaction(
    @QueryParam('startDate') startDate: string,
    @QueryParam('endDate') endDate: string,
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    averageRating: number;
    ratingDistribution: any[];
    trends: any[];
    feedback: any[];
  }> {
    const companyId = request.headers['company-id'];
    return this.customerReportsService.getCustomerSatisfaction(
      companyId,
      startDate ? new Date(startDate) : undefined,
      endDate ? new Date(endDate) : undefined
    );
  }

  /**
   * 🔹 Export customer data
   */
  @Get('/export')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_EXPORT_CUSTOMERS'])
  public async exportCustomerData(
    @QueryParam('format') format: 'csv' | 'excel' | 'pdf' = 'csv',
    @QueryParam('filters') filters: string,
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{ downloadUrl: string; expiresAt: Date }> {
    const companyId = request.headers['company-id'];
    const filterData = filters ? JSON.parse(filters) : {};
    return this.customerReportsService.exportCustomerData(companyId, format, filterData);
  }
}

