import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class OrderExtraChargeCreateRequest {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsOptional()
  @IsNumber()
  serviceExtraId?: number;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsNumber()
  deliveredQuantity?: number;

  @IsOptional()
  @IsBoolean()
  isDelivered?: boolean;
}

