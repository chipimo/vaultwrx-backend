// controllers/SecurityAccessControlController.ts
import { SecurityAccessControl } from '@base/api/models/Security-access-control/SecurityAccessControl';
import { SecurityAccessControlService } from '@base/api/services/Security/SecurityAccessControlService';
import { JsonController, Post, Body, HttpCode, Authorized } from 'routing-controllers';
import { Service } from 'typedi';

@Service()
@JsonController('/security-access-controls')
export class SecurityAccessControlController {
  constructor(private securityAccessControlService: SecurityAccessControlService) {}

  @Authorized(['admin'])
  @HttpCode(201)
  @Post('/')
  public async createAccessControl(@Body() data: Partial<SecurityAccessControl>): Promise<SecurityAccessControl> {
    return this.securityAccessControlService.createAccessControl(data);
  }
}