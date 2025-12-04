import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, MaxLength } from 'class-validator';
import { ColorType } from '@api/models/Products/Color';

export class ColorCreateRequest {
  @IsOptional()
  retailerId?: number;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

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

