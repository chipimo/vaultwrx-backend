import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req } from 'routing-controllers';
import { ColorService } from '@api/services/Products/ColorService';
import { Service } from 'typedi';
import { ColorCreateRequest } from '@api/requests/Products/ColorCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { ColorUpdateRequest } from '@api/requests/Products/ColorUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/colors')
@UseBefore(AuthCheck)
export class ColorController extends ControllerBase {
  public constructor(private colorService: ColorService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.colorService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.colorService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() color: ColorCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.colorService.create(color, companyId);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() color: ColorUpdateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.colorService.updateOneById(id, color, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.colorService.deleteOneById(id, companyId);
  }
}

