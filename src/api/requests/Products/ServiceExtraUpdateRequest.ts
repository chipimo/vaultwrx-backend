import { IsOptional, IsString, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class ServiceExtraUpdateRequest {
  @IsOptional()
  @IsNumber()
  retailerId?: number;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

