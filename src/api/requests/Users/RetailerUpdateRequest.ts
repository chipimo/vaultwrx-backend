import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class RetailerUpdateRequest {
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

