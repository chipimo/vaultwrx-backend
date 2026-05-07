import {
  IsArray,
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  PriceListExtraPayload,
  PriceListItemPayload
} from './PriceListCreateRequest';

export class PriceListUpdateRequest {
  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * Replaces existing `price_list_products`. Pass the full intended state
   * — anything not in this array gets removed from the list.
   */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceListItemPayload)
  items?: PriceListItemPayload[];

  /** Replaces existing `price_list_extras` (same semantics as `items`). */
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PriceListExtraPayload)
  extras?: PriceListExtraPayload[];
}
