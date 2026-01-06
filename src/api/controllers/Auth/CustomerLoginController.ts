import { JsonController, Post, Body, HttpCode, Authorized, CurrentUser } from 'routing-controllers';
import { Service } from 'typedi';
import { CustomerLoginService } from '@base/api/services/Auth/CustomerLoginService';
import { CustomerLoginRequest } from '@base/api/requests/Auth/CustomerLoginRequest';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@OpenAPI({
  tags: ['Customer Authentication'],
  description: 'Customer authentication endpoints for login and logout',
})
@JsonController('/customers/auth')
export class CustomerLoginController {
  constructor(private customerLoginService: CustomerLoginService) {}

  @HttpCode(200)
  @Post('/login')
  public async login(@Body() data: CustomerLoginRequest): Promise<{ token: string; customer: any }> {
    return this.customerLoginService.login(data);
  }

  @HttpCode(200)
  @Post('/logout')
  @Authorized()
  public async logout(@CurrentUser() user: any): Promise<{ message: string }> {
    return this.customerLoginService.logout(user);
  }


  @HttpCode(200)
  @Post('/refresh')
  @Authorized()
  public async refreshToken(@CurrentUser() user: any): Promise<{ token: string }> {
    return this.customerLoginService.refreshToken(user);
  }

  @HttpCode(200)
  @Post('/me')
  @Authorized()
  public async getCurrentCustomer(@CurrentUser() user: any): Promise<any> {
    return this.customerLoginService.getCurrentCustomer(user);
  }
}