import { JsonController, Get, Put, Body, Authorized, CurrentUser, HttpCode } from 'routing-controllers';
import { Service } from 'typedi';
import { CustomerService } from '@base/api/services/Customer/CustomerService';
import { CustomerProfileUpdateRequest } from '@base/api/requests/Customers/CustomerProfileUpdateRequest';
import { CustomerChangePasswordRequest } from '@base/api/requests/Auth/CustomerChangePasswordRequest';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@OpenAPI({
  tags: ['Customer Profile Management'],
  description: 'Customer self-service profile management endpoints',
})
@JsonController('/customers/profile')
export class CustomerProfileController {
  constructor(private customerService: CustomerService) {}

  /**
   * 🔹 Get current customer profile
   */
  @Get('/')
  @Authorized()
  public async getProfile(@CurrentUser() user: any): Promise<any> {
    return this.customerService.getCustomerById(user.customerId, user.companyId);
  }

  /**
   * 🔹 Update customer profile
   */
  @Put('/')
  @Authorized()
  public async updateProfile(
    @Body() data: CustomerProfileUpdateRequest,
    @CurrentUser() user: any
  ): Promise<any> {
    return this.customerService.updateCustomerProfile(user.customerId, data);
  }

  /**
   * 🔹 Change customer password
   */
  @Put('/password')
  @Authorized()
  @HttpCode(200)
  public async changePassword(
    @Body() data: CustomerChangePasswordRequest,
    @CurrentUser() user: any
  ): Promise<{ message: string }> {
    await this.customerService.changeCustomerPassword(user.customerId, data);
    return { message: 'Password has been successfully changed' };
  }

  /**
   * 🔹 Get customer loyalty points
   */
  @Get('/loyalty-points')
  @Authorized()
  public async getLoyaltyPoints(@CurrentUser() user: any): Promise<{ loyaltyPoints: number }> {
    const customer = await this.customerService.getCustomerById(user.customerId, user.companyId);
    return { loyaltyPoints: customer.loyaltyPoints };
  }

  /**
   * 🔹 Get customer orders
   */
  @Get('/orders')
  @Authorized()
  public async getOrders(@CurrentUser() user: any): Promise<any[]> {
    const customer = await this.customerService.getCustomerById(user.customerId, user.companyId);
    return customer.orders || [];
  }

  /**
   * 🔹 Get customer payments
   */
  @Get('/payments')
  @Authorized()
  public async getPayments(@CurrentUser() user: any): Promise<any[]> {
    const customer = await this.customerService.getCustomerById(user.customerId, user.companyId);
    return customer.payments || [];
  }

  /**
   * 🔹 Get customer invoices
   */
  @Get('/invoices')
  @Authorized()
  public async getInvoices(@CurrentUser() user: any): Promise<any[]> {
    const customer = await this.customerService.getCustomerById(user.customerId, user.companyId);
    return customer.invoices || [];
  }
}

