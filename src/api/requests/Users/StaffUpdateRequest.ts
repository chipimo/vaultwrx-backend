import { IsOptional, IsString, IsBoolean, IsNumber, IsDateString } from 'class-validator';

export class StaffUpdateRequest {
  @IsOptional()
  @IsNumber()
  company_id?: number;

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

