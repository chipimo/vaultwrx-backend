import { IsOptional, IsString, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class CategoryUpdateRequest {
  @IsOptional()
  @IsString()
  retailerId?: string;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

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

