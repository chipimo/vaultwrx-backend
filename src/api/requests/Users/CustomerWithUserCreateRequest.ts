import {
  IsNotEmpty,
  IsString,
  IsOptional,
  IsBoolean,
  MinLength,
  MaxLength,
  IsEmail,
  IsDateString,
  IsIn,
  IsArray
} from 'class-validator';

const BILLING_OPTIONS = ['on_account', 'credit_card', 'ach'] as const;

/**
 * Create a customer user plus customer profile for the company from x-company-id.
 * Maps to the retailer "Create customer" full form (business + primary contact + extras).
 */
export class CustomerWithUserCreateRequest {
  @MaxLength(20)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  first_name: string;

  @MaxLength(20)
  @MinLength(2)
  @IsString()
  @IsNotEmpty()
  last_name: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string;

  @MaxLength(100)
  @MinLength(6)
  @IsString()
  @IsNotEmpty()
  password: string;

  @MaxLength(255)
  @MinLength(1)
  @IsString()
  @IsNotEmpty()
  business_name: string;

  @IsEmail()
  @IsString()
  @IsNotEmpty()
  business_email: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsOptional()
  @IsString()
  fax?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  state?: string;

  @IsOptional()
  @IsString()
  zipCode?: string;

  @IsOptional()
  @IsString()
  contact_phone?: string;

  @IsOptional()
  @IsString()
  sales_representative?: string;

  @IsOptional()
  @IsIn(BILLING_OPTIONS)
  billing_option?: (typeof BILLING_OPTIONS)[number];

  @IsOptional()
  @IsString()
  tags?: string;

  @IsOptional()
  @IsString()
  special_order_instructions?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  pricelist_selections?: Array<{
    categoryId: string;
    enabled: boolean;
    pricelistId?: string | null;
    locationId?: string | null;
  }>;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  preferredContactMethod?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  allow_customer_see_prices?: boolean;
}
