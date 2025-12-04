import { IsNotEmpty, IsNumber, IsOptional, IsString, IsBoolean, IsEnum, IsDateString } from 'class-validator';
import { ProductType, EngravingPosition, Gender, CremationType, WitnessType, GraveType } from '@api/models/Orders/OrderItem';

export class OrderItemCreateRequest {
  @IsNotEmpty()
  @IsNumber()
  orderId: number;

  @IsOptional()
  @IsNumber()
  productId?: number;

  @IsOptional()
  @IsEnum(ProductType)
  productType?: ProductType;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;

  @IsOptional()
  @IsNumber()
  unitPrice?: number;

  @IsOptional()
  @IsNumber()
  totalPrice?: number;

  @IsOptional()
  @IsString()
  customization?: string;

  @IsOptional()
  @IsString()
  engraving?: string;

  @IsOptional()
  @IsEnum(EngravingPosition)
  engravingPosition?: EngravingPosition;

  @IsOptional()
  @IsString()
  engravingFont?: string;

  @IsOptional()
  @IsString()
  engravingColor?: string;

  @IsOptional()
  @IsString()
  theme?: string;

  @IsOptional()
  @IsNumber()
  paintColorId?: number;

  @IsOptional()
  @IsDateString()
  deliverBy?: string;

  @IsOptional()
  @IsString()
  deliveryTime?: string;

  @IsOptional()
  @IsString()
  deliveryLocation?: string;

  @IsOptional()
  @IsString()
  comments?: string;

  @IsOptional()
  @IsString()
  height?: string;

  @IsOptional()
  @IsString()
  weight?: string;

  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @IsOptional()
  @IsBoolean()
  isEmbalmed?: boolean;

  @IsOptional()
  @IsString()
  bodyContainer?: string;

  @IsOptional()
  @IsEnum(CremationType)
  cremationType?: CremationType;

  @IsOptional()
  @IsBoolean()
  witnessesPresent?: boolean;

  @IsOptional()
  @IsEnum(WitnessType)
  witnessType?: WitnessType;

  @IsOptional()
  @IsString()
  cremainsContainer?: string;

  @IsOptional()
  @IsBoolean()
  lastDayLettering?: boolean;

  @IsOptional()
  @IsBoolean()
  monumentInPlace?: boolean;

  @IsOptional()
  @IsString()
  nameOnStone?: string;

  @IsOptional()
  @IsEnum(GraveType)
  graveType?: GraveType;

  @IsOptional()
  @IsBoolean()
  graveOpeningClosing?: boolean;

  @IsOptional()
  @IsBoolean()
  graveOpeningOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  graveClosingOnly?: boolean;

  @IsOptional()
  @IsString()
  cemetery?: string;

  @IsOptional()
  @IsString()
  section?: string;

  @IsOptional()
  @IsString()
  graveSpace?: string;

  @IsOptional()
  @IsString()
  serviceTime?: string;

  @IsOptional()
  @IsDateString()
  serviceDate?: string;

  @IsOptional()
  @IsDateString()
  requestedCompletionDate?: string;
}

