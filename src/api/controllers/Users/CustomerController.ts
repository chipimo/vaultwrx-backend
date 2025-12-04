import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req } from 'routing-controllers';
import { CustomerService } from '@api/services/Users/CustomerService';
import { Service } from 'typedi';
import { CustomerCreateRequest } from '@api/requests/Users/CustomerCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { CustomerUpdateRequest } from '@api/requests/Users/CustomerUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/customers')
@UseBefore(AuthCheck)
export class CustomerController extends ControllerBase {
  public constructor(private customerService: CustomerService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.customerService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.customerService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() customer: CustomerCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.customerService.create(customer, companyId);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() customer: CustomerUpdateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.customerService.updateOneById(id, customer, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.customerService.deleteOneById(id, companyId);
  }
}

