import { IsNotEmpty, IsString, IsOptional, IsEmail, MaxLength } from 'class-validator';

export class CompanyCreateRequest {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

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

