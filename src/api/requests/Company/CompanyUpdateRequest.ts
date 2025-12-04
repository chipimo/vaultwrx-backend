import { IsOptional, IsString, IsEmail, MaxLength } from 'class-validator';

export class CompanyUpdateRequest {
  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  address?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  type?: string;
}

