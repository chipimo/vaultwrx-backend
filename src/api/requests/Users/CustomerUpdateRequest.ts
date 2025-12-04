import { IsOptional, IsString, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class CustomerUpdateRequest {
  @IsOptional()
  @IsNumber()
  company_id?: number;

  @IsOptional()
  @IsString()
  phone?: string;

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
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  preferredContactMethod?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

