import { IsOptional, IsString, IsBoolean, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Gender } from '@api/models/Orders/OrderItem';

export class DeceasedUpdateRequest {
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsDateString()
  birthDate?: string;

  @IsOptional()
  @IsDateString()
  deathDate?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsBoolean()
  isEmbalmed?: boolean;
}

