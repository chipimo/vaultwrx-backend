import { Param, Get, JsonController, Post, Body, Put, Patch, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { RetailerService } from '@api/services/Users/RetailerService';
import { Service } from 'typedi';
import { RetailerCreateRequest } from '@api/requests/Users/RetailerCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { RetailerUpdateRequest } from '@api/requests/Users/RetailerUpdateRequest';
import { CalendarChargesUpdateRequest } from '@api/requests/Users/CalendarChargesUpdateRequest';
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

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();
    return await this.retailerService.findOneById(id as any, resourceOptions);
  }

  @Get('/:id/calendar-charges')
  public async getCalendarCharges(@Param('id') id: string) {
    return await this.retailerService.getCalendarCharges(id);
  }

  @Patch('/:id/calendar-charges')
  public async updateCalendarCharges(@Param('id') id: string, @Body() body: CalendarChargesUpdateRequest) {
    return await this.retailerService.updateCalendarCharges(id, body);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() retailer: RetailerCreateRequest) {
    return await this.retailerService.create(retailer);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() retailer: RetailerUpdateRequest) {
    return await this.retailerService.updateOneById(id as any, retailer);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string) {
    return await this.retailerService.deleteOneById(id as any);
  }
}

