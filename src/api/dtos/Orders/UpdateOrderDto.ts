import { IsString, IsEnum, IsOptional, IsDateString, IsUUID } from 'class-validator';
import { OrderStatus } from '@base/api/models/Sales-and-orders/Order';

export class UpdateOrderDto {
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsString()
  voterName?: string;

  @IsOptional()
  @IsDateString()
  voterDateOfBirth?: string;

  @IsOptional()
  @IsString()
  voterRegistrationNumber?: string;

  @IsOptional()
  @IsString()
  electionName?: string;

  @IsOptional()
  @IsDateString()
  electionDate?: string;

  @IsOptional()
  @IsString()
  pollingStation?: string;

  @IsOptional()
  @IsString()
  district?: string;

  @IsOptional()
  @IsString()
  constituency?: string;

  @IsOptional()
  @IsString()
  deliveryAddress?: string;

  @IsOptional()
  @IsString()
  deliveryCity?: string;

  @IsOptional()
  @IsString()
  deliveryState?: string;

  @IsOptional()
  @IsString()
  deliveryZipCode?: string;

  @IsOptional()
  @IsString()
  deliveryCountry?: string;

  @IsOptional()
  @IsDateString()
  deliveryDate?: string;

  @IsOptional()
  @IsDateString()
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @IsOptional()
  @IsUUID()
  assignedToId?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class AssignOrderDto {
  @IsUUID()
  assignedToId: string;
}

export class CancelOrderDto {
  @IsOptional()
  @IsString()
  reason?: string;
}
