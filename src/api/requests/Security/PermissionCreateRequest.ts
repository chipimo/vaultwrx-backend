import { IsNotEmpty, IsString, IsOptional, IsEnum } from 'class-validator';
import { PermissionResource, PermissionAction } from '@api/models/Security/Permission';

export class PermissionCreateRequest {
  @IsEnum(PermissionResource)
  @IsNotEmpty()
  resource: PermissionResource;

  @IsEnum(PermissionAction)
  @IsNotEmpty()
  action: PermissionAction;

  @IsOptional()
  @IsString()
  description?: string;
}

