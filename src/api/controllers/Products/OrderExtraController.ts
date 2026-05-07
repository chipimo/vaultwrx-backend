import { Get, Post, Body, Delete, HttpCode, JsonController, Param, UseBefore, QueryParams, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OrderExtraService } from '@api/services/Products/OrderExtraService';
import { OrderExtraCreateRequest } from '@api/requests/Products/OrderExtraCreateRequest';

/**
 * Read-only endpoints for the `order_extras` template table.
 * Mounted at `/order-extras` so it doesn't collide with
 * `/order-extra-charges` (the per-order line items).
 */
@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }]
})
@JsonController('/order-extras')
@UseBefore(AuthCheck)
export class OrderExtraController extends ControllerBase {
  public constructor(private orderExtraService: OrderExtraService) {
    super();
  }

  @Get()
  public async getAll(
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() req: Request
  ) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();

    const categoryId = (req.query.categoryId as string) || undefined;
    const skip = req.query.skip !== undefined ? Number(req.query.skip) : undefined;
    const take = req.query.take !== undefined ? Number(req.query.take) : undefined;

    return await this.orderExtraService.getAll(resourceOptions, companyId, {
      categoryId,
      skip,
      take,
    });
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.orderExtraService.findOneById(id, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() body: OrderExtraCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.orderExtraService.create(body, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.orderExtraService.deleteOneById(id, companyId);
  }
}
