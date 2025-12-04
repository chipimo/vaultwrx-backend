import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class RetailerCreateRequest {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsOptional()
  @IsString()
  businessLicense?: string;

  @IsOptional()
  @IsString()
  taxId?: string;

  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;
}

