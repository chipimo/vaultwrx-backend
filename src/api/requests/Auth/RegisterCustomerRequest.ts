// requests/Auth/RegisterCustomerRequest.ts
import { IsEmail, IsNotEmpty, IsOptional, IsBoolean, IsString } from 'class-validator';

export class RegisterCustomerRequest {
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @IsNotEmpty()
  @IsString()
  lastName: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  // Optional fields
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  taxType?: string;

  @IsOptional()
  @IsString()
  taxIdNumber?: string;

  @IsOptional()
  @IsBoolean()
  isCompany?: boolean;

  @IsOptional()
  @IsString()
  companyName?: string;

  // If the customer is an individual affiliated with a company, store the parent's company ID.
  @IsOptional()
  @IsString()
  parentCompanyId?: string;
}