import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { OrderContactService } from '@api/services/Orders/OrderContactService';
import { Service } from 'typedi';
import { OrderContactCreateRequest } from '@api/requests/Orders/OrderContactCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { OrderContactUpdateRequest } from '@api/requests/Orders/OrderContactUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/order-contacts')
@UseBefore(AuthCheck)
export class OrderContactController extends ControllerBase {
  public constructor(private orderContactService: OrderContactService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.orderContactService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.orderContactService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() orderContact: OrderContactCreateRequest) {
    return await this.orderContactService.create(orderContact);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() orderContact: OrderContactUpdateRequest) {
    return await this.orderContactService.updateOneById(id, orderContact);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.orderContactService.deleteOneById(id);
  }
}

