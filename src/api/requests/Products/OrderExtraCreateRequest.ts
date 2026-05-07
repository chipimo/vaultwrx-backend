import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsUUID,
  MaxLength
} from 'class-validator';

export class OrderExtraCreateRequest {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  /** Foreign key into retailer_categories. */
  @IsNotEmpty()
  @IsUUID()
  categoryId: string;

  @IsOptional()
  @IsString()
  description?: string;

  /**
   * Default master-price-list price. The repo writes this into
   * `price_list_extras` against the retailer's default price list so the new
   * extra appears in the master list automatically.
   */
  @IsNotEmpty()
  @IsNumber()
  price: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
