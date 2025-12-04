import { IsOptional, IsString, IsBoolean, IsEnum, IsNumber, MaxLength } from 'class-validator';
import { ColorType } from '@api/models/Products/Color';

export class ColorUpdateRequest {
  @IsOptional()
  @IsNumber()
  retailerId?: number;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  hexCode?: string;

  @IsOptional()
  @IsEnum(ColorType)
  type?: ColorType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

