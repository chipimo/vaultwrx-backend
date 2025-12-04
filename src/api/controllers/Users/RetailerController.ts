import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { RetailerService } from '@api/services/Users/RetailerService';
import { Service } from 'typedi';
import { RetailerCreateRequest } from '@api/requests/Users/RetailerCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { RetailerUpdateRequest } from '@api/requests/Users/RetailerUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/retailers')
@UseBefore(AuthCheck)
export class RetailerController extends ControllerBase {
  public constructor(private retailerService: RetailerService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.retailerService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.retailerService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() retailer: RetailerCreateRequest) {
    return await this.retailerService.create(retailer);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() retailer: RetailerUpdateRequest) {
    return await this.retailerService.updateOneById(id, retailer);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.retailerService.deleteOneById(id);
  }
}

