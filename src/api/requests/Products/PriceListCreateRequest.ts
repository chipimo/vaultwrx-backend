import {
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class PriceListItemPayload {
  @IsUUID()
  productId: string;

  @IsNumber()
  price: number;
}

export class PriceListExtraPayload {
  @IsOptional()
  @IsUUID()
  serviceExtraId?: string;

  @IsOptional()
  @IsUUID()
  orderExtraId?: string;

  @IsNumber()
  price: number;
}

export class PriceListCreateRequest {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /** Per-product entries inserted into `price_list_products`. */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceListItemPayload)
  items?: PriceListItemPayload[];

  /**
   * Per-extra entries inserted into `price_list_extras`. Each row points at
   * either a service-extra or an order-extra (mutually exclusive).
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceListExtraPayload)
  extras?: PriceListExtraPayload[];
}
