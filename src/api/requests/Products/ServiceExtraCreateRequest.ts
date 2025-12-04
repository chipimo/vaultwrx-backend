import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, MaxLength } from 'class-validator';

export class ServiceExtraCreateRequest {
  @IsNotEmpty()
  @IsNumber()
  retailerId: number;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

