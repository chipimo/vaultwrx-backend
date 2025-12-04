import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { FuneralDirectorService } from '@api/services/Users/FuneralDirectorService';
import { Service } from 'typedi';
import { FuneralDirectorCreateRequest } from '@api/requests/Users/FuneralDirectorCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { FuneralDirectorUpdateRequest } from '@api/requests/Users/FuneralDirectorUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/funeral-directors')
@UseBefore(AuthCheck)
export class FuneralDirectorController extends ControllerBase {
  public constructor(private funeralDirectorService: FuneralDirectorService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.funeralDirectorService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.funeralDirectorService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() funeralDirector: FuneralDirectorCreateRequest) {
    return await this.funeralDirectorService.create(funeralDirector);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() funeralDirector: FuneralDirectorUpdateRequest) {
    return await this.funeralDirectorService.updateOneById(id, funeralDirector);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.funeralDirectorService.deleteOneById(id);
  }
}

