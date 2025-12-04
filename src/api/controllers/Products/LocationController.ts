import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req } from 'routing-controllers';
import { LocationService } from '@api/services/Products/LocationService';
import { Service } from 'typedi';
import { LocationCreateRequest } from '@api/requests/Products/LocationCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { LocationUpdateRequest } from '@api/requests/Products/LocationUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/locations')
@UseBefore(AuthCheck)
export class LocationController extends ControllerBase {
  public constructor(private locationService: LocationService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.locationService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.locationService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() location: LocationCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.locationService.create(location, companyId);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() location: LocationUpdateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.locationService.updateOneById(id, location, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.locationService.deleteOneById(id, companyId);
  }
}

