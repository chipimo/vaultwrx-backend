import { IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';

export class OrderExtraChargeUpdateRequest {
  @IsOptional()
  @IsNumber()
  orderId?: number;

  @IsOptional()
  @IsNumber()
  serviceExtraId?: number;

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsNumber()
  price?: number;

  @IsOptional()
  @IsNumber()
  deliveredQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isDelivered?: boolean;
}

