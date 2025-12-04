import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { Gender } from '@api/models/Orders/OrderItem';

export class DeceasedCreateRequest {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsNotEmpty()
  @IsString()
  name: string;

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

