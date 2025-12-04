import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { DeliveryScheduleService } from '@api/services/Orders/DeliveryScheduleService';
import { Service } from 'typedi';
import { DeliveryScheduleCreateRequest } from '@api/requests/Orders/DeliveryScheduleCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { DeliveryScheduleUpdateRequest } from '@api/requests/Orders/DeliveryScheduleUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/delivery-schedules')
@UseBefore(AuthCheck)
export class DeliveryScheduleController extends ControllerBase {
  public constructor(private deliveryScheduleService: DeliveryScheduleService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.deliveryScheduleService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.deliveryScheduleService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() deliverySchedule: DeliveryScheduleCreateRequest) {
    return await this.deliveryScheduleService.create(deliverySchedule);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() deliverySchedule: DeliveryScheduleUpdateRequest) {
    return await this.deliveryScheduleService.updateOneById(id, deliverySchedule);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.deliveryScheduleService.deleteOneById(id);
  }
}

