import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CustomerPasswordResetRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

