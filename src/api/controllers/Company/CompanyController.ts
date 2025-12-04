import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { CompanyService } from '@api/services/Company/CompanyService';
import { Service } from 'typedi';
import { CompanyCreateRequest } from '@api/requests/Company/CompanyCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { CompanyUpdateRequest } from '@api/requests/Company/CompanyUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/companies')
@UseBefore(AuthCheck)
export class CompanyController extends ControllerBase {
  public constructor(private companyService: CompanyService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.companyService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.companyService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() company: CompanyCreateRequest) {
    return await this.companyService.create(company);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() company: CompanyUpdateRequest) {
    return await this.companyService.updateOneById(id, company);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.companyService.deleteOneById(id);
  }
}

