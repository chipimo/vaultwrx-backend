import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req } from 'routing-controllers';
import { StaffService } from '@api/services/Users/StaffService';
import { Service } from 'typedi';
import { StaffCreateRequest } from '@api/requests/Users/StaffCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { StaffUpdateRequest } from '@api/requests/Users/StaffUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/staff')
@UseBefore(AuthCheck)
export class StaffController extends ControllerBase {
  public constructor(private staffService: StaffService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.staffService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.staffService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() staff: StaffCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.staffService.create(staff, companyId);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() staff: StaffUpdateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.staffService.updateOneById(id, staff, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.staffService.deleteOneById(id, companyId);
  }
}

