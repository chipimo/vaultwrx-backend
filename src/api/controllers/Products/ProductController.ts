import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req, UploadedFile } from 'routing-controllers';
import { ProductService } from '@api/services/Products/ProductService';
import { Service } from 'typedi';
import { ProductCreateRequest } from '@api/requests/Products/ProductCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { ProductUpdateRequest } from '@api/requests/Products/ProductUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { NotFoundError } from 'routing-controllers';
import { StorageService } from '@base/infrastructure/services/storage/StorageService';
import * as multer from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const fileUploadOptions = {
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'), false);
    }
  },
};

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/products')
@UseBefore(AuthCheck)
export class ProductController extends ControllerBase {
  public constructor(
    private productService: ProductService,
    private storageService: StorageService
  ) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();

    // Direct query params bypass the unreliable filters[…] parser.
    const retailerCategoryId = (req.query.retailerCategoryId as string) || undefined;
    const type = (req.query.type as string) || undefined;
    const skip = req.query.skip !== undefined ? Number(req.query.skip) : undefined;
    const take = req.query.take !== undefined ? Number(req.query.take) : undefined;

    return await this.productService.getAll(resourceOptions, companyId, {
      retailerCategoryId,
      type,
      skip,
      take,
    });
  }

  @Get('/grouped-by-type')
  public async getGroupedByType(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.productService.getProductsGroupedByType(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.productService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() product: ProductCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.productService.create(product, companyId);
  }

  @Post('/:id/upload-image')
  @HttpCode(200)
  public async uploadImage(
    @Param('id') id: string,
    @UploadedFile('file', { options: fileUploadOptions }) file: Express.Multer.File,
    @Req() req: Request
  ) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    if (!file) {
      throw new Error('No file uploaded');
    }

    // Get product type from the product
    const product = await this.productService.findOneById(id, undefined, companyId);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = `products/${product.type}/${uniqueFileName}`;

    // Save file to storage
    await this.storageService.put(filePath, file.buffer);

    // Update product with image info
    const updateData = {
      image: `/uploads/${filePath}`,
      imageName: file.originalname,
    };

    return await this.productService.updateOneById(id, updateData, companyId);
  }

  @Delete('/:id/image')
  @HttpCode(200)
  public async deleteImage(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    // Clear the image fields
    const updateData: { image: string | null; imageName: string | null } = {
      image: null,
      imageName: null,
    };

    return await this.productService.updateOneById(id, updateData, companyId);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() product: ProductUpdateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.productService.updateOneById(id, product, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.productService.deleteOneById(id, companyId);
  }
}
