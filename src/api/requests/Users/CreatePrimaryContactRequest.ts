import { IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength, IsEmail } from 'class-validator';

export class CreatePrimaryContactRequest {
  @IsUUID()
  @IsNotEmpty()
  company_id: string;

  @IsUUID()
  @IsNotEmpty()
  customer_id: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  name: string;

  @IsOptional()
  @IsEmail()
  @MaxLength(255)
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  phone?: string;

  @IsOptional()
  @IsString()
  specialization?: string;
}
