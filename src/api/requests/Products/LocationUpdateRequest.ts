import { IsOptional, IsString, IsBoolean, IsNumber, IsEmail, MaxLength } from 'class-validator';

export class LocationUpdateRequest {
  @IsOptional()
  @IsNumber()
  retailerId?: number;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

