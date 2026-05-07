import { Get, JsonController, UseBefore, QueryParams, Req } from 'routing-controllers';
import { Service } from 'typedi';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { RetailerCategoryService } from '@api/services/Products/RetailerCategoryService';

/**
 * Read-only endpoint that returns the active company's retailer categories.
 * Powers the "Category" dropdown on the products page.
 */
@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }]
})
@JsonController('/retailer-categories')
@UseBefore(AuthCheck)
export class RetailerCategoryController extends ControllerBase {
  public constructor(private retailerCategoryService: RetailerCategoryService) {
    super();
  }

  @Get()
  public async getAll(
    @QueryParams() parseResourceOptions: RequestQueryParser,
    @Req() req: Request
  ) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.retailerCategoryService.getAll(resourceOptions, companyId);
  }
}
