import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsEmail, MaxLength } from 'class-validator';

export class OrderContactCreateRequest {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsOptional()
  @IsNumber()
  customerId?: number;

  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

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

