import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CategoryCreateRequest {
  @IsOptional()
  retailerId?: string;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @MaxLength(50)
  @IsString()
  code?: string;

  @IsOptional()
  @IsNumber()
  sortOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

