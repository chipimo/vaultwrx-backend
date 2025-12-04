import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { RoleService } from '@api/services/Security/RoleService';
import { Service } from 'typedi';
import { RoleCreateRequest } from '@api/requests/Security/RoleCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { RoleUpdateRequest } from '@api/requests/Security/RoleUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/roles')
@UseBefore(AuthCheck)
export class RoleController extends ControllerBase {
  public constructor(private roleService: RoleService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.roleService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.roleService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() role: RoleCreateRequest) {
    return await this.roleService.create(role);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() role: RoleUpdateRequest) {
    return await this.roleService.updateOneById(id, role);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.roleService.deleteOneById(id);
  }
}

