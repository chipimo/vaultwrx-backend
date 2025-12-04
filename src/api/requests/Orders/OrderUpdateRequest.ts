import { IsOptional, IsString, IsNumber, IsBoolean, IsEnum, IsDateString, IsEmail, IsUUID, MaxLength } from 'class-validator';
import { OrderStatus, ServiceType } from '@api/models/Orders/Order';

export class OrderUpdateRequest {
  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  retailerId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsOptional()
  @IsUUID()
  directorId?: string;

  @IsOptional()
  @IsUUID()
  staffId?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @IsOptional()
  @IsNumber()
  total?: number;

  @IsOptional()
  @IsNumber()
  subtotal?: number;

  @IsOptional()
  @IsNumber()
  discount?: number;

  @IsOptional()
  @IsNumber()
  salesTax?: number;

  @IsOptional()
  @IsBoolean()
  applyPlatformFee?: boolean;

  @IsOptional()
  @IsString()
  serviceTypeName?: string;

  @IsOptional()
  @IsNumber()
  serviceTypePrice?: number;

  @IsOptional()
  @IsString()
  cemetery?: string;

  @IsOptional()
  @IsUUID()
  locationId?: string;

  @IsOptional()
  @IsDateString()
  dateOfService?: string;

  @IsOptional()
  @IsString()
  timeOfService?: string;

  @IsOptional()
  @IsString()
  arrivalTime?: string;

  @IsOptional()
  @IsString()
  contact?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  cellPhone?: string;

  @IsOptional()
  @IsBoolean()
  isDeleted?: boolean;

  @IsOptional()
  @IsBoolean()
  isEdited?: boolean;

  @IsOptional()
  @IsBoolean()
  isParent?: boolean;

  @IsOptional()
  @IsBoolean()
  delivered?: boolean;

  @IsOptional()
  @IsBoolean()
  confirmed?: boolean;

  @IsOptional()
  @IsBoolean()
  newOrderNotificationsSent?: boolean;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  deliveryInstructions?: string;

  @IsOptional()
  @IsString()
  orderDStatus?: string;

  @IsOptional()
  @IsString()
  productPaintColorOptions?: string;

  @IsOptional()
  @IsString()
  emblem?: string;

  @IsOptional()
  @IsString()
  serviceExtras?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  storeName?: string;

  @IsOptional()
  @IsString()
  storeAddress1?: string;

  @IsOptional()
  @IsString()
  storeAddress2?: string;

  @IsOptional()
  @IsString()
  storeCity?: string;

  @IsOptional()
  @IsString()
  storeState?: string;

  @IsOptional()
  @IsString()
  storeZip?: string;
}

