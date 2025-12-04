import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req } from 'routing-controllers';
import { CommentService } from '@api/services/Orders/CommentService';
import { Service } from 'typedi';
import { CommentCreateRequest } from '@api/requests/Orders/CommentCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { CommentUpdateRequest } from '@api/requests/Orders/CommentUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/comments')
@UseBefore(AuthCheck)
export class CommentController extends ControllerBase {
  public constructor(private commentService: CommentService) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const resourceOptions = parseResourceOptions.getAll();
    const orderId = req.query.orderId as string;

    return await this.commentService.getAll(resourceOptions, orderId);
  }

  @Get('/order/:orderId')
  public async getByOrderId(
    @Param('orderId') orderId: string,
    @QueryParams() parseResourceOptions: RequestQueryParser
  ) {
    const resourceOptions = parseResourceOptions.getAll();
    return await this.commentService.getAll(resourceOptions, orderId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.commentService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() comment: CommentCreateRequest) {
    return await this.commentService.create(comment);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() comment: CommentUpdateRequest) {
    return await this.commentService.updateOneById(id, comment);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string) {
    return await this.commentService.deleteOneById(id);
  }
}

