import { IsOptional, IsString, IsEnum, IsNumber } from 'class-validator';
import { PhotoType } from '@api/models/Orders/Photo';

export class PhotoUpdateRequest {
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  userId?: number;

  @IsOptional()
  @IsString()
  url?: string;

  @IsOptional()
  @IsEnum(PhotoType)
  type?: PhotoType;

  @IsOptional()
  @IsString()
  fileName?: string;

  @IsOptional()
  @IsNumber()
  fileSize?: number;

  @IsOptional()
  @IsString()
  mimeType?: string;
}

