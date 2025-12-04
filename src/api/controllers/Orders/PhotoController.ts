import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams } from 'routing-controllers';
import { PhotoService } from '@api/services/Orders/PhotoService';
import { Service } from 'typedi';
import { PhotoCreateRequest } from '@api/requests/Orders/PhotoCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { PhotoUpdateRequest } from '@api/requests/Orders/PhotoUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/photos')
@UseBefore(AuthCheck)
export class PhotoController extends ControllerBase {
  public constructor(private photoService: PhotoService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.photoService.getAll(resourceOptions);
  }

  @Get('/:id([0-9]+)')
  public async getOne(@Param('id') id: number, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.photoService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() photo: PhotoCreateRequest) {
    return await this.photoService.create(photo);
  }

  @Put('/:id')
  public async update(@Param('id') id: number, @Body() photo: PhotoUpdateRequest) {
    return await this.photoService.updateOneById(id, photo);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: number) {
    return await this.photoService.deleteOneById(id);
  }
}

