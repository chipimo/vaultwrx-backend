import { IsNotEmpty, IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { RoleType } from '@api/models/Security/Role';
import { Permission } from '@api/models/Security/Permission';

export class RoleCreateRequest {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(RoleType)
  @IsNotEmpty()
  type: RoleType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsArray()
  permissions?: Permission[];
}

