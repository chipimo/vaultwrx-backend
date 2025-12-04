import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { AdminService } from '@api/services/Users/AdminService';
import { Service } from 'typedi';
import { AdminCreateRequest } from '@api/requests/Users/AdminCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { AdminUpdateRequest } from '@api/requests/Users/AdminUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/admins')
@UseBefore(AuthCheck)
export class AdminController extends ControllerBase {
  public constructor(private adminService: AdminService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.adminService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.adminService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() admin: AdminCreateRequest) {
    return await this.adminService.create(admin);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() admin: AdminUpdateRequest) {
    return await this.adminService.updateOneById(id, admin);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.adminService.deleteOneById(id);
  }
}

