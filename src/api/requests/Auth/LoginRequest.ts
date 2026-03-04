import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class RefreshTokenRequest {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ForgotPasswordRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ResetPasswordRequest {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  password: string;
}

export class VerifyEmailRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class ChangePasswordRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string;
}

export class VerifyLoginRequest {
  @IsNotEmpty()
  @IsString()
  employeeId: string;

  @IsNotEmpty()
  @IsString()
  companyId: string;
}
