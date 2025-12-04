import { IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { RoleType } from '@api/models/Security/Role';
import { Permission } from '@api/models/Security/Permission';

export class RoleUpdateRequest {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(RoleType)
  type?: RoleType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: Permission[];
}

