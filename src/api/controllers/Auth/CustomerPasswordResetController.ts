import { JsonController, Post, Body, HttpCode, Authorized, CurrentUser } from 'routing-controllers';
import { Service } from 'typedi';
import { CustomerPasswordResetService } from '@base/api/services/Auth/CustomerPasswordResetService';
import { CustomerPasswordResetRequest } from '@base/api/requests/Auth/CustomerPasswordResetRequest';
import { CustomerChangePasswordRequest } from '@base/api/requests/Auth/CustomerChangePasswordRequest';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@OpenAPI({
  tags: ['Customer Password Management'],
  description: 'Customer password reset and change endpoints',
})
@JsonController('/customers/password')
export class CustomerPasswordResetController {
  constructor(private customerPasswordResetService: CustomerPasswordResetService) {}

  /**
   * 🔹 Request password reset
   */
  @HttpCode(200)
  @Post('/reset-request')
  public async requestPasswordReset(@Body() data: CustomerPasswordResetRequest): Promise<{ message: string }> {
    return this.customerPasswordResetService.requestPasswordReset(data);
  }

  /**
   * 🔹 Reset password with token
   */
  @HttpCode(200)
  @Post('/reset')
  public async resetPassword(
    @Body() data: { token: string; newPassword: string }
  ): Promise<{ message: string }> {
    return this.customerPasswordResetService.resetPassword(data.token, data.newPassword);
  }

  /**
   * 🔹 Change password (for authenticated customers)
   */
  @HttpCode(200)
  @Post('/change')
  @Authorized()
  public async changePassword(
    @Body() data: CustomerChangePasswordRequest,
    @CurrentUser() user: any
  ): Promise<{ message: string }> {
    return this.customerPasswordResetService.changePassword(user.customerId, data);
  }
}

