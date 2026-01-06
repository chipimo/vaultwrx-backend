// controllers/EmployeeRegisterController.ts
import { JsonController, Post, Body, HttpCode } from 'routing-controllers';
import { Service } from 'typedi';
import { EmployeeRegisterService } from '@api/services/Auth/EmployeeRegisterService';
import { RegisterEmployeeRequest } from '@api/requests/Auth/RegisterEmployeeRequest';

@Service()
@JsonController('/employees/register')
export class EmployeeRegisterController {
  constructor(private registerService: EmployeeRegisterService) {}

  @HttpCode(201)
  @Post()
  public async register(@Body() data: RegisterEmployeeRequest): Promise<{ token: object }> {
    const token = await this.registerService.register(data);
    return { token };
  }
}