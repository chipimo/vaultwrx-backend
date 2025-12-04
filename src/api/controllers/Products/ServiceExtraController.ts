import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req } from 'routing-controllers';
import { ServiceExtraService } from '@api/services/Products/ServiceExtraService';
import { Service } from 'typedi';
import { ServiceExtraCreateRequest } from '@api/requests/Products/ServiceExtraCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { ServiceExtraUpdateRequest } from '@api/requests/Products/ServiceExtraUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/service-extras')
@UseBefore(AuthCheck)
export class ServiceExtraController extends ControllerBase {
  public constructor(private serviceExtraService: ServiceExtraService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.serviceExtraService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.serviceExtraService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() serviceExtra: ServiceExtraCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.serviceExtraService.create(serviceExtra, companyId);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() serviceExtra: ServiceExtraUpdateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.serviceExtraService.updateOneById(id, serviceExtra, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.serviceExtraService.deleteOneById(id, companyId);
  }
}

