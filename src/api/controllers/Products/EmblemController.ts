import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req, UploadedFile } from 'routing-controllers';
import { EmblemService } from '@api/services/Products/EmblemService';
import { Service } from 'typedi';
import { EmblemCreateRequest } from '@api/requests/Products/EmblemCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { EmblemUpdateRequest } from '@api/requests/Products/EmblemUpdateRequest';
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
    fileSize: 5 * 1024 * 1024, // 5MB limit for emblems
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG are allowed.'), false);
    }
  },
};

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/emblems')
@UseBefore(AuthCheck)
export class EmblemController extends ControllerBase {
  public constructor(
    private emblemService: EmblemService,
    private storageService: StorageService
  ) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.emblemService.getAll(resourceOptions, companyId);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    const resourceOptions = parseResourceOptions.getAll();
    return await this.emblemService.findOneById(id, resourceOptions, companyId);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() emblem: EmblemCreateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.emblemService.create(emblem, companyId);
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

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = `emblems/${uniqueFileName}`;

    // Save file to storage
    await this.storageService.put(filePath, file.buffer);

    // Update emblem with image info
    const updateData = {
      image: `/uploads/${filePath}`,
      imageName: file.originalname,
    };

    return await this.emblemService.updateOneById(id, updateData, companyId);
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

    return await this.emblemService.updateOneById(id, updateData, companyId);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() emblem: EmblemUpdateRequest, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.emblemService.updateOneById(id, emblem, companyId);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string, @Req() req: Request) {
    const companyId = (req.headers['company-id'] || req.headers['x-company-id']) as string;
    if (!companyId) throw new NotFoundError('Company ID is required in the headers.');

    return await this.emblemService.deleteOneById(id, companyId);
  }
}
