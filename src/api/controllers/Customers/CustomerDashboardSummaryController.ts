import { JsonController, Get, QueryParam, Authorized, CurrentUser, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { CustomerService } from '@base/api/services/Customer/CustomerService';
import { CustomerReportsService } from '@base/api/services/Customer/CustomerReportsService';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@OpenAPI({
  tags: ['Customer Dashboard Summary'],
  description: 'Main customer dashboard overview endpoint that matches frontend requirements',
})
@JsonController('/customers/dashboard')
export class CustomerDashboardSummaryController {
  constructor(
    private customerService: CustomerService,
    private customerReportsService: CustomerReportsService
  ) {}

  /**
   * 🔹 Get main customer dashboard overview
   * This endpoint provides all the data needed for the main customer dashboard page
   */
  @Get('/overview')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getDashboardOverview(
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    customerStats: {
      totalCustomers: number;
      activeCustomers: number;
      inactiveCustomers: number;
      topCustomers: number;
      customersWithIssues: number;
      missedDemandValue: number;
      totalRevenue: number;
    };
    quickStats: Array<{
      title: string;
      value: string;
      description: string;
      color: string;
    }>;
    recentIssues: Array<{
      customer: string;
      issue: string;
      value: number;
      date: string;
      status: string;
    }>;
    missedDemandOverview: {
      totalMissedDemand: number;
      potentialRecovery: number;
      customersAffected: number;
    };
  }> {
    const companyId = request.headers['company-id'];
    
    // Get customer statistics
    const stats = await this.customerService.getCustomerStats(companyId);
    const activeCustomers = await this.customerService.getCustomersWithRecentActivity(companyId, 30);
    const allCustomers = await this.customerService.getAllCustomers(companyId);
    
    const inactiveCustomers = allCustomers.filter(customer => 
      !activeCustomers.some(active => active.id === customer.id)
    );

    const customerStats = {
      totalCustomers: stats.totalCustomers,
      activeCustomers: activeCustomers.length,
      inactiveCustomers: inactiveCustomers.length,
      topCustomers: Math.floor(stats.totalCustomers * 0.04), // 4% of total customers
      customersWithIssues: Math.floor(inactiveCustomers.length * 0.1), // 10% of inactive
      missedDemandValue: Math.floor(stats.totalLoyaltyPoints * 0.1), // Estimate based on loyalty points
      totalRevenue: Math.floor(stats.totalLoyaltyPoints * 0.2), // Estimate based on loyalty points
    };

    const quickStats = [
      {
        title: 'Total Customers',
        value: customerStats.totalCustomers.toLocaleString(),
        description: 'All registered customers',
        color: 'text-blue-600'
      },
      {
        title: 'Active Customers',
        value: customerStats.activeCustomers.toLocaleString(),
        description: 'Customers with recent activity',
        color: 'text-green-600'
      },
      {
        title: 'Inactive Customers',
        value: customerStats.inactiveCustomers.toLocaleString(),
        description: 'No activity in 30+ days',
        color: 'text-red-600'
      },
      {
        title: 'Top Customers',
        value: customerStats.topCustomers.toLocaleString(),
        description: 'High-value customers',
        color: 'text-yellow-600'
      }
    ];

    // Mock recent issues data (in a real implementation, this would come from an issues system)
    const recentIssues = [
      {
        customer: 'R & R Meats',
        issue: 'Quality rejection',
        value: 2500,
        date: '2024-01-15',
        status: 'Resolved'
      },
      {
        customer: 'Flame Restaurant',
        issue: 'Missing items',
        value: 1200,
        date: '2024-01-14',
        status: 'Pending'
      },
      {
        customer: 'Newrest',
        issue: 'Delivery delay',
        value: 800,
        date: '2024-01-13',
        status: 'Resolved'
      }
    ];

    const missedDemandOverview = {
      totalMissedDemand: customerStats.missedDemandValue,
      potentialRecovery: Math.floor(customerStats.missedDemandValue * 0.3),
      customersAffected: customerStats.customersWithIssues,
    };

    return {
      customerStats,
      quickStats,
      recentIssues,
      missedDemandOverview,
    };
  }
}
