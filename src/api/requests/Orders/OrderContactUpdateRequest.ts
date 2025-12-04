import { IsOptional, IsString, IsBoolean, IsNumber, IsEmail, MaxLength } from 'class-validator';

export class OrderContactUpdateRequest {
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @IsOptional()
  @IsString()
  relationship?: string;

  @IsOptional()
  @IsBoolean()
  isPrimary?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

