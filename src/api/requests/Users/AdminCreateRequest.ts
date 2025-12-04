import { IsNotEmpty, IsString, IsOptional, IsBoolean, IsNumber } from 'class-validator';

export class AdminCreateRequest {
  @IsNumber()
  @IsNotEmpty()
  user_id: number;

  @IsOptional()
  @IsString()
  adminLevel?: string;

  @IsOptional()
  @IsBoolean()
  canManageCompanies?: boolean;

  @IsOptional()
  @IsBoolean()
  canManageAdmins?: boolean;
}

