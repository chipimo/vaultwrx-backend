import { Param, Get, JsonController, Post, Body, Put, Delete, HttpCode, UseBefore, QueryParams, UploadedFile } from 'routing-controllers';
import { CompanyService } from '@api/services/Company/CompanyService';
import { Service } from 'typedi';
import { CompanyCreateRequest } from '@api/requests/Company/CompanyCreateRequest';
import { AuthCheck } from '@base/infrastructure/middlewares/Auth/AuthCheck';
import { ControllerBase } from '@base/infrastructure/abstracts/ControllerBase';
import { CompanyUpdateRequest } from '@api/requests/Company/CompanyUpdateRequest';
import { OpenAPI } from 'routing-controllers-openapi';
import { RequestQueryParser } from 'typeorm-simple-query-parser';
import { StorageService } from '@base/infrastructure/services/storage/StorageService';
import * as multer from 'multer';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

// Multer configuration for logo uploads
const storage = multer.memoryStorage();
const logoUploadOptions = {
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit for logos
  },
  fileFilter: (req: any, file: any, cb: any) => {
    const allowedMimes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, and GIF are allowed.'), false);
    }
  },
};

@Service()
@OpenAPI({
  security: [{ bearerAuth: [] }],
})
@JsonController('/companies')
@UseBefore(AuthCheck)
export class CompanyController extends ControllerBase {
  public constructor(
    private companyService: CompanyService,
    private storageService: StorageService
  ) {
    super();
  }

  @Get()
  public async getAll(@QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.companyService.getAll(resourceOptions);
  }

  @Get('/:id')
  public async getOne(@Param('id') id: string, @QueryParams() parseResourceOptions: RequestQueryParser) {
    const resourceOptions = parseResourceOptions.getAll();

    return await this.companyService.findOneById(id, resourceOptions);
  }

  @Post()
  @HttpCode(201)
  public async create(@Body() company: CompanyCreateRequest) {
    return await this.companyService.create(company);
  }

  @Put('/:id')
  public async update(@Param('id') id: string, @Body() company: CompanyUpdateRequest) {
    return await this.companyService.updateOneById(id, company);
  }

  @Post('/:id/upload-logo')
  @HttpCode(200)
  public async uploadLogo(
    @Param('id') id: string,
    @UploadedFile('file', { options: logoUploadOptions }) file: Express.Multer.File
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    // Verify company exists
    await this.companyService.findOneById(id);

    // Generate unique filename
    const fileExtension = path.extname(file.originalname);
    const uniqueFileName = `${uuidv4()}${fileExtension}`;
    const filePath = `companies/${id}/logo/${uniqueFileName}`;

    // Save file to storage
    await this.storageService.put(filePath, file.buffer);

    // Update company with logo URL
    const logoUrl = `/uploads/${filePath}`;
    await this.companyService.updateOneById(id, { logo: logoUrl });

    return {
      success: true,
      logoUrl: logoUrl,
      message: 'Logo uploaded successfully'
    };
  }

  @Delete('/:id')
  @HttpCode(204)
  public async delete(@Param('id') id: string) {
    return await this.companyService.deleteOneById(id);
  }
}

