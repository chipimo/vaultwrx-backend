import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class StaffCreateRequest {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsNumber()
  @IsNotEmpty()
  company_id: number;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  department?: string;

  @IsOptional()
  @IsString()
  position?: string;

  @IsOptional()
  @IsDateString()
  hireDate?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

