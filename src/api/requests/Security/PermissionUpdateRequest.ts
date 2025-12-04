import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PermissionResource, PermissionAction } from '@api/models/Security/Permission';

export class PermissionUpdateRequest {
  @IsOptional()
  @IsEnum(PermissionResource)
  resource?: PermissionResource;

  @IsOptional()
  @IsEnum(PermissionAction)
  action?: PermissionAction;

  @IsOptional()
  @IsString()
  description?: string;
}

