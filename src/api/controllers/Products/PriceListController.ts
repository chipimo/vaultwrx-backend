import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { PriceListService } from '@api/services/Products/PriceListService';
import { PriceListCreateRequest } from '@api/requests/Products/PriceListCreateRequest';
import { PriceListUpdateRequest } from '@api/requests/Products/PriceListUpdateRequest';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }]
})
@JsonController('/price-lists')
@UseBefore(AuthCheck)
export class PriceListController extends ControllerBase {
  public constructor(private priceListService: PriceListService) {
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
    return await this.priceListService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(
    @Param('id') id: string,
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() req: Request
  ) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.priceListService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() priceList: PriceListCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.priceListService.create(priceList, companyId);
  }

  @Put('/:id')
  public async update(
    @Param('id') id: string,
    @Body() priceList: PriceListUpdateRequest,
    @Req() req: Request
  ) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.priceListService.updateOneById(id, priceList, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.priceListService.deleteOneById(id, companyId);
  }
}
