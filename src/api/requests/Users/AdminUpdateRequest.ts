import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class AdminUpdateRequest {
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

