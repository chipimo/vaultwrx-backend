import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { DeceasedService } from '@api/services/Orders/DeceasedService';
import { Service } from 'typedi';
import { DeceasedCreateRequest } from '@api/requests/Orders/DeceasedCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { DeceasedUpdateRequest } from '@api/requests/Orders/DeceasedUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/deceased')
@UseBefore(AuthCheck)
export class DeceasedController extends ControllerBase {
  public constructor(private deceasedService: DeceasedService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.deceasedService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.deceasedService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() deceased: DeceasedCreateRequest) {
    return await this.deceasedService.create(deceased);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() deceased: DeceasedUpdateRequest) {
    return await this.deceasedService.updateOneById(id, deceased);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.deceasedService.deleteOneById(id);
  }
}

