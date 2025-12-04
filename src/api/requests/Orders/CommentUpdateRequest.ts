import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CommentUpdateRequest {
  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsString()
  commentType?: string;
}

