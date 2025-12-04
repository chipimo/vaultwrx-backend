import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { PermissionService } from '@api/services/Security/PermissionService';
import { Service } from 'typedi';
import { PermissionCreateRequest } from '@api/requests/Security/PermissionCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { PermissionUpdateRequest } from '@api/requests/Security/PermissionUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/permissions')
@UseBefore(AuthCheck)
export class PermissionController extends ControllerBase {
  public constructor(private permissionService: PermissionService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.permissionService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.permissionService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() permission: PermissionCreateRequest) {
    return await this.permissionService.create(permission);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() permission: PermissionUpdateRequest) {
    return await this.permissionService.updateOneById(id, permission);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.permissionService.deleteOneById(id);
  }
}

