import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { ProductType } from '@api/models/Products/Product';

export class ProductUpdateRequest {
  @IsOptional()
  @IsNumber()
  retailerId?: number;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  quantity?: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  imageName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  history?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

