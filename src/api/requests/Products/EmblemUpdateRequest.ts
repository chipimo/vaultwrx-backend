import { IsOptional, IsString, IsBoolean, MaxLength } from 'class-validator';

export class EmblemUpdateRequest {
  @IsOptional()
  @IsString()
  retailerId?: string;

  @IsOptional()
  @MaxLength(255)
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  imageName?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

