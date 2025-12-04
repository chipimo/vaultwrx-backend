import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { ProductType } from '@api/models/Products/Product';

export class ProductCreateRequest {
  @IsOptional()
  @IsNumber()
  retailerId?: number;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsEnum(ProductType)
  type?: ProductType;

  @IsOptional()
  @IsString()
  category?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

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

