import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, Req, UploadedFile } from 'routing-controllers';
import { PhotoService } from '@api/services/Orders/PhotoService';
import { Service } from 'typedi';
import { PhotoCreateRequest } from '@api/requests/Orders/PhotoCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { PhotoUpdateRequest } from '@api/requests/Orders/PhotoUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { Request } from 'express';
import { StorageService } from '@base/infrastructure/services/storage/StorageService';
import { PhotoType } from '@api/models/Orders/Photo';
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
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and PDF are allowed.'), false);
    }
  },
};

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/photos')
@UseBefore(AuthCheck)
export class PhotoController extends ControllerBase {
  public constructor(
    private photoService: PhotoService,
    private storageService: StorageService
  ) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();
    return await this.photoService.getAll(resourceOptions);
  }

  @Get('/order/:orderId')
  public async getByOrderId(@Param('orderId') orderId: string, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();
    return await this.photoService.getByOrderId(orderId, resourceOptions);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();
    return await this.photoService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() photo: PhotoCreateRequest) {
    return await this.photoService.create(photo);
  }

  @Post('/upload')
  @HttpCode(201)
  public async uploadPhoto(
    @UploadedFile('file', { options: fileUploadOptions }) file: Express.Multer.File,
    @Req() req: Request
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const orderId = req.body.orderId;
    const userId = req.body.userId;
    const photoType = req.body.type || PhotoType.OTHER;

    if (!orderId || !userId) {
      throw new Error('orderId and userId are required');
    }

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = `orders/${orderId}/${uniqueFileName}`;

    // Save file to storage
    await this.storageService.put(filePath, file.buffer);

    // Create photo record
    const photoData = {
      orderId,
      userId,
      url: `/uploads/${filePath}`,
      type: photoType,
      fileName: file.originalname,
      fileSize: file.size,
      mimeType: file.mimetype,
    };

    return await this.photoService.create(photoData);
  }

  @Post('/upload-multiple')
  @HttpCode(201)
  public async uploadMultiplePhotos(
    @Req() req: Request
  ) {
    // This endpoint handles multiple file uploads
    // Files are expected in req.files
    const files = (req as any).files as Express.Multer.File[];
    const orderId = req.body.orderId;
    const userId = req.body.userId;
    const photoType = req.body.type || PhotoType.OTHER;

    if (!orderId || !userId) {
      throw new Error('orderId and userId are required');
    }

    if (!files || files.length === 0) {
      throw new Error('No files uploaded');
    }

    const uploadedPhotos = [];

    for (const file of files) {
      const fileExtension = path.extname(file.originalname);
      const uniqueFileName = `${uuidv4()}${fileExtension}`;
      const filePath = `orders/${orderId}/${uniqueFileName}`;

      await this.storageService.put(filePath, file.buffer);

      const photoData = {
        orderId,
        userId,
        url: `/uploads/${filePath}`,
        type: photoType,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
      };

      const photo = await this.photoService.create(photoData);
      uploadedPhotos.push(photo);
    }

    return uploadedPhotos;
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() photo: PhotoUpdateRequest) {
    return await this.photoService.updateOneById(id, photo);
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string) {
    return await this.photoService.deleteOneById(id);
  }
}
