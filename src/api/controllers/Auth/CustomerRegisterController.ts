// controllers/CustomerRegisterController.ts
import { JsonController, Post, Body, HttpCode } from 'routing-controllers';
import { Service } from 'typedi';
import { CustomerRegisterService } from '@api/services/Auth/CustomerRegisterService';
import { RegisterCustomerRequest } from '@api/requests/Auth/RegisterCustomerRequest';
import { OpenAPI } from 'routing-controllers-openapi';

@Service()
@OpenAPI({
  tags: ['Auth'],
})
@JsonController('/customers/register')
export class CustomerRegisterController {
  constructor(private registerService: CustomerRegisterService) {}

  @HttpCode(201)
  @Post()
  public async register(@Body() data: RegisterCustomerRequest): Promise<{ token: object }> {
    const token = await this.registerService.register(data);
    return { token };
  }
}