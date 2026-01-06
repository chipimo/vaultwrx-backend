import { JsonController, Get, Post, Put, Body, Param, QueryParam, Authorized, CurrentUser, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { CustomerService } from '@base/api/services/Customer/CustomerService';
import { CustomerLoyaltyService } from '@base/api/services/Customer/CustomerLoyaltyService';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@OpenAPI({
  tags: ['Customer Loyalty Management'],
  description: 'Customer loyalty points and rewards management endpoints',
})
@JsonController('/customers/loyalty')
export class CustomerLoyaltyController {
  constructor(
    private customerService: CustomerService,
    private customerLoyaltyService: CustomerLoyaltyService
  ) {}

 
  @Get('/:customerId/points')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomerLoyaltyPoints(
    @Param('customerId') customerId: string,
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{ loyaltyPoints: number; tier: string }> {
    const companyId = request.headers['company-id'];
    const customer = await this.customerService.getCustomerById(customerId, companyId);
    const tier = this.customerLoyaltyService.getCustomerTier(customer.loyaltyPoints);
    
    return {
      loyaltyPoints: customer.loyaltyPoints,
      tier,
    };
  }

  /**
   * 🔹 Add loyalty points to customer
   */
  @Post('/:customerId/points/add')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_UPDATE_CUSTOMERS'])
  public async addLoyaltyPoints(
    @Param('customerId') customerId: string,
    @Body() data: { points: number; reason: string },
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{ message: string; newPoints: number }> {
    const companyId = request.headers['company-id'];
    const customer = await this.customerService.updateLoyaltyPoints(customerId, data.points, companyId);
    
    // Log loyalty points transaction
    await this.customerLoyaltyService.logLoyaltyTransaction(
      customerId,
      data.points,
      'earned',
      data.reason,
      user.id
    );

    return {
      message: `Successfully added ${data.points} loyalty points`,
      newPoints: customer.loyaltyPoints,
    };
  }

  /**
   * 🔹 Redeem loyalty points
   */
  @Post('/:customerId/points/redeem')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_UPDATE_CUSTOMERS'])
  public async redeemLoyaltyPoints(
    @Param('customerId') customerId: string,
    @Body() data: { points: number; reason: string },
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{ message: string; newPoints: number }> {
    const companyId = request.headers['company-id'];
    const customer = await this.customerService.updateLoyaltyPoints(customerId, -data.points, companyId);
    
    // Log loyalty points transaction
    await this.customerLoyaltyService.logLoyaltyTransaction(
      customerId,
      -data.points,
      'redeemed',
      data.reason,
      user.id
    );

    return {
      message: `Successfully redeemed ${data.points} loyalty points`,
      newPoints: customer.loyaltyPoints,
    };
  }

  /**
   * 🔹 Get customer loyalty history
   */
  @Get('/:customerId/history')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getLoyaltyHistory(
    @Param('customerId') customerId: string,
    @QueryParam('page') page: number = 1,
    @QueryParam('limit') limit: number = 10,
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{ transactions: any[]; total: number; page: number; limit: number }> {
    const companyId = request.headers['company-id'];
    return this.customerLoyaltyService.getLoyaltyHistory(customerId, companyId, page, limit);
  }

  /**
   * 🔹 Get loyalty tiers
   */
  @Get('/tiers')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getLoyaltyTiers(): Promise<any[]> {
    return this.customerLoyaltyService.getLoyaltyTiers();
  }

  /**
   * 🔹 Get customers by loyalty tier
   */
  @Get('/tier/:tier')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getCustomersByTier(
    @Param('tier') tier: string,
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<any[]> {
    const companyId = request.headers['company-id'];
    return this.customerLoyaltyService.getCustomersByTier(companyId, tier);
  }

  /**
   * 🔹 Get loyalty statistics
   */
  @Get('/stats')
  @Authorized(['admin', 'assistant_admin', 'CAN_MANAGE_ALL', 'CAN_VIEW_CUSTOMERS'])
  public async getLoyaltyStats(
    @Req() request: any,
    @CurrentUser() user: any
  ): Promise<{
    totalPointsIssued: number;
    totalPointsRedeemed: number;
    activeCustomers: number;
    tierDistribution: any[];
  }> {
    const companyId = request.headers['company-id'];
    return this.customerLoyaltyService.getLoyaltyStats(companyId);
  }
}

