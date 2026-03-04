import { IsOptional, IsNumber, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CalendarChargesUpdateRequest {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  saturdayCharge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  sundayCharge?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  holidayCharge?: number;
}
