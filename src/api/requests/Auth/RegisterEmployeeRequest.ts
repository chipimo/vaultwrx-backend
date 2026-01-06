// requests/Auth/RegisterEmployeeRequest.ts
import { IsEmail, IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';

export class RegisterEmployeeRequest {
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

  // Optional field for profile image URL
  @IsOptional()
  @IsString()
  profileImageUrl?: string;

  // Optional field to assign a role (e.g., cashier, manager)
  @IsOptional()
  @IsNumber()
  roleId?: string;

  // Optional field to assign the employee to a store
  @IsOptional()
  @IsNumber()
  storeId?: string;
}