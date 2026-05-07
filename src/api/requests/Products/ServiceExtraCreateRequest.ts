import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  MaxLength
} from 'class-validator';

export class ServiceExtraCreateRequest {
  @MaxLength(255)
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsNotEmpty()
  @IsNumber()
  price: number;

  /**
   * Free-form tag stored on `service_extras.category`. The products page
   * uses the retailer-category label here ("Cremation", "Vaults", ...) so
   * the table can filter on it via direct `?category=…` query.
   */
  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  /**
   * Optional retailer override. Almost never sent from the products page;
   * the repository derives retailerId from the company-id header instead.
   * Kept here so other clients (admin tools, scripts) can override.
   */
  @IsOptional()
  @IsString()
  retailerId?: string;
}
