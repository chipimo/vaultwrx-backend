import { IsOptional, IsString, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class FuneralDirectorUpdateRequest {
  @IsOptional()
  @IsNumber()
  company_id?: number;

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

