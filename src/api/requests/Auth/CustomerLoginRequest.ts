import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CustomerLoginRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

