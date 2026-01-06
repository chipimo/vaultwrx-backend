import { 
  JsonController, 
  Post, 
  Get, 
  Put, 
  Delete, 
  Body, 
  Param, 
  Req, 
  Authorized,
  CurrentUser
} from 'routing-controllers';
import { Service } from 'typedi';
import { Request } from 'express';
import { LoggedUserInterface } from '@base/api/interfaces/users/LoggedUserInterface';
import { AuditService } from '@base/api/services/Security/AuditService';
import { AuditActionType, AuditResourceType } from '@base/api/models/Security-access-control/AuditLog';
import { AuditLog as AuditLogDecorator } from '@base/decorators/AuditLog';

@Service()
@JsonController('/audit-example')
export class AuditExampleController {
  constructor(private auditService: AuditService) {}

  // Example using the decorator
  @AuditLogDecorator({
    action: AuditActionType.CREATE,
    resourceType: AuditResourceType.SYSTEM,
    resourceName: 'Example Resource',
    captureNewValues: true,
  })
  @Authorized(['admin', 'manager'])
  @Post('/create-with-decorator')
  public async createWithDecorator(
    @Body() data: any,
    @CurrentUser() user: LoggedUserInterface,
    @Req() req: Request
  ): Promise<any> {
    // Simulate creating a resource
    const result = {
      id: 'example-id',
      name: data.name,
      createdAt: new Date(),
    };

    return result;
  }

  // Example using manual audit logging
  @Authorized(['admin', 'manager'])
  @Post('/create-manual')
  public async createManual(
    @Body() data: any,
    @CurrentUser() user: LoggedUserInterface | null,
    @Req() req: Request
  ): Promise<any> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    // Simulate creating a resource
    const result = {
      id: 'example-id',
      name: data.name,
      createdAt: new Date(),
    };

    // Manually log the audit entry
    await this.auditService.logCreate(
      user,
      companyId,
      req,
      AuditResourceType.SYSTEM,
      result.id,
      `Example Resource: ${result.name}`,
      result,
      `Created example resource: ${result.name}`
    );

    return result;
  }

  // Example of logging different types of actions
  @Authorized(['admin', 'manager'])
  @Get('/view-example/:id')
  public async viewExample(
    @Param('id') id: string,
    @CurrentUser() user: LoggedUserInterface | null,
    @Req() req: Request
  ): Promise<any> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    // Simulate fetching a resource
    const result = {
      id,
      name: 'Example Resource',
      description: 'This is an example resource',
    };

    // Log the view action
    await this.auditService.logView(
      user,
      companyId,
      req,
      AuditResourceType.SYSTEM,
      id,
      `Example Resource: ${result.name}`,
      `Viewed example resource: ${result.name}`
    );

    return result;
  }

  // Example of logging with error handling
  @Authorized(['admin', 'manager'])
  @Post('/create-with-error')
  public async createWithError(
    @Body() data: any,
    @CurrentUser() user: LoggedUserInterface | null,
    @Req() req: Request
  ): Promise<any> {
    const companyId = req.headers['company-id'] as string;
    if (!companyId) {
      throw new Error('Company ID is required in headers');
    }

    try {
      // Simulate an operation that might fail
      if (data.shouldFail) {
        throw new Error('Simulated error for testing');
      }

      const result = {
        id: 'example-id',
        name: data.name,
        createdAt: new Date(),
      };

      // Log successful creation
      await this.auditService.logCreate(
        user,
        companyId,
        req,
        AuditResourceType.SYSTEM,
        result.id,
        `Example Resource: ${result.name}`,
        result,
        `Created example resource: ${result.name}`
      );

      return result;
    } catch (error) {
      // Log the failed attempt
      await this.auditService.logActivity(user, companyId, req, {
        action: AuditActionType.CREATE,
        resourceType: AuditResourceType.SYSTEM,
        resourceName: 'Example Resource',
        description: `Failed to create example resource: ${data.name}`,
        isSuccessful: false,
        errorMessage: error.message,
      });

      throw error;
    }
  }
}
