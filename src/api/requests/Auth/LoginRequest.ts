import { IsNotEmpty, IsString, IsOptional, IsEmail } from 'class-validator';

export class LoginRequest {
  @IsNotEmpty()
  @IsString()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;
}

export class ChangePasswordRequest {
  @IsNotEmpty()
  @IsString()
  currentPassword: string;

  @IsNotEmpty()
  @IsString()
  oldPassword: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ForgotPasswordRequest {
  @IsNotEmpty()
  @IsEmail()
  email: string;
}

export class RefreshTokenRequest {
  @IsNotEmpty()
  @IsString()
  refreshToken: string;

  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class ResetPasswordRequest {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsNotEmpty()
  @IsString()
  newPassword: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  confirmPassword: string;
}

export class VerifyEmailRequest {
  @IsNotEmpty()
  @IsString()
  token: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}

export class VerifyLoginRequest {
  @IsNotEmpty()
  @IsString()
  code: string;

  @IsOptional()
  @IsString()
  sessionId?: string;

  @IsOptional()
  @IsString()
  employeeId?: string;

  @IsOptional()
  @IsString()
  companyId?: string;
}
