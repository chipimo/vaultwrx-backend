import { IsNotEmpty, IsString, IsOptional, IsEnum, IsDateString, IsNumber } from 'class-validator';
import { DeliveryStatus, DeliveryGraveType } from '@api/models/Orders/DeliverySchedule';

export class DeliveryScheduleCreateRequest {
  @IsNotEmpty()
  @IsNumber()
  orderItemId: number;

  @IsOptional()
  @IsNumber()
  assignedStaffId?: number;

  @IsOptional()
  @IsString()
  cemetery?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  plotNumber?: string;

  @IsOptional()
  @IsEnum(DeliveryGraveType)
  graveType?: DeliveryGraveType;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  arrivalAtGraveside?: string;

  @IsOptional()
  @IsEnum(DeliveryStatus)
  status?: DeliveryStatus;
}

