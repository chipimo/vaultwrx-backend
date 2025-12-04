import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class FuneralDirectorCreateRequest {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  company_id: number;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsDateString()
  licenseExpiry?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsString()
  specialization?: string;

  @IsOptional()
  @IsNumber()
  yearsOfExperience?: number;
}

