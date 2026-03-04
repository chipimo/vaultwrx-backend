import { Param, Get, JsonController, UseBefore, Req } from 'routing-controllers';
import { OrderHistoryService } from '@api/services/Orders/OrderHistoryService';
import { Service } from 'typedi';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { OpenAPI } from 'routing-controllers-openapi';
import { NotFoundError, ForbiddenError } from 'routing-controllers';
import { LoggedUser } from '@base/decorators/LoggedUser';
import { OrderHistory } from '@api/models/Orders/OrderHistory';
import { RoleType } from '@api/models/Security/Role';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/orders/history')
@UseBefore(AuthCheck)
export class OrderHistoryController {
  constructor(private orderHistoryService: OrderHistoryService) {}

  @Get()
  public async getHistory(
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<{ total_data: number; rows: OrderHistory[] }> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];
    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }
    if (!user) {
      throw new NotFoundError('Authentication required.');
    }
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access order history from this company.');
      }
    }

    const orderType = request.query?.orderType as string | undefined;
    const dateFrom = request.query?.dateFrom as string | undefined;
    const dateTo = request.query?.dateTo as string | undefined;
    const page = request.query?.page != null ? Number(request.query.page) : undefined;
    const limit = request.query?.limit != null ? Number(request.query.limit) : undefined;

    return await this.orderHistoryService.getMany(companyId, {
      orderType,
      dateFrom,
      dateTo,
    }, { page, limit });
  }

  @Get('/grouped-by-date-and-product-type')
  public async getGroupedByDateAndProductType(
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<Array<{ date: string; [key: string]: any }>> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];
    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }
    if (!user) {
      throw new NotFoundError('Authentication required.');
    }
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access order history from this company.');
      }
    }

    const orderType = request.query?.orderType as string | undefined;
    const page = request.query?.page != null ? Number(request.query.page) : undefined;
    const limit = request.query?.limit != null ? Number(request.query.limit) : undefined;

    return await this.orderHistoryService.getOrdersGroupedByDateAndProductType(
      companyId,
      orderType,
      { page, limit }
    );
  }

  @Get('/:id')
  public async getOne(
    @Param('id') id: string,
    @Req() request: any,
    @LoggedUser() user: any
  ): Promise<OrderHistory> {
    const companyId = request.headers['company-id'] || request.headers['x-company-id'];
    if (!companyId) {
      throw new NotFoundError('Company ID is required in the headers.');
    }
    if (!user) {
      throw new NotFoundError('Authentication required.');
    }
    if (user.roleType !== RoleType.ADMIN) {
      const userCompanyId = user.owned_company_id || user.company_id;
      if (!userCompanyId) {
        throw new ForbiddenError('You are not associated with any company.');
      }
      if (companyId !== userCompanyId) {
        throw new ForbiddenError('You are not allowed to access order history from this company.');
      }
    }

    return await this.orderHistoryService.getOneById(id, companyId);
  }
}
