import { IsString, IsOptional, IsBoolean, IsEmail, IsNumber, Min } from 'class-validator';

export class CustomerProfileUpdateRequest {
  @IsString()
  @IsOptional()
  firstName?: string;

  @IsString()
  @IsOptional()
  lastName?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  taxType?: string;

  @IsString()
  @IsOptional()
  taxIdNumber?: string;

  @IsBoolean()
  @IsOptional()
  isCompany?: boolean;

  @IsString()
  @IsOptional()
  companyName?: string;

  @IsString()
  @IsOptional()
  parentCompanyId?: string;

  @IsNumber()
  @IsOptional()
  @Min(0)
  loyaltyPoints?: number;
}

