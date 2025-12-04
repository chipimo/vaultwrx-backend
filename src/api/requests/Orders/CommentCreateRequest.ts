import { IsNotEmpty, IsString, IsOptional, IsUUID } from 'class-validator';

export class CommentCreateRequest {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsOptional()
  @IsUUID()
  userId?: string;

  @IsOptional()
  @IsUUID()
  customerId?: string;

  @IsNotEmpty()
  @IsString()
  comment: string;

  @IsOptional()
  @IsString()
  commentType?: string;
}

