import { IsString, IsEnum, IsOptional, IsDateString, IsNumber, IsArray, ValidateNested, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { OrderType, DeliveryMethod } from '@base/api/models/Sales-and-orders/Order';
import { ItemType } from '@base/api/models/Sales-and-orders/OrderItem';

export class CreateOrderItemDto {
  @IsString()
  itemName: string;

  @IsOptional()
  @IsString()
  itemDescription?: string;

  @IsEnum(ItemType)
  itemType: ItemType;

  @IsNumber()
  @Min(1)
  @Max(10000)
  quantity: number;

  @IsNumber()
  @Min(0)
  unitPrice: number;

  @IsOptional()
  @IsString()
  ballotType?: string;

  @IsOptional()
  @IsString()
  language?: string;

  @IsOptional()
  @IsString()
  paperType?: string;

  @IsOptional()
  @IsString()
  printingSpecifications?: string;

  @IsOptional()
  @IsString()
  customizationNotes?: string;

  @IsOptional()
  customFields?: any;

  @IsOptional()
  @IsDateString()
  serviceStartDate?: string;

  @IsOptional()
  @IsDateString()
  serviceEndDate?: string;

  @IsOptional()
  @IsString()
  serviceLocation?: string;
}

export class CreateOrderDto {
  @IsUUID()
  customerId: string;

  @IsEnum(OrderType)
  orderType: OrderType;

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
  @IsEnum(DeliveryMethod)
  deliveryMethod?: DeliveryMethod;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  orderItems: CreateOrderItemDto[];
}
