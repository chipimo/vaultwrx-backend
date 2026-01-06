import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { InvalidCredentials } from '@api/exceptions/Auth/InvalidCredentials';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import {
  ChangePasswordRequest,
  ForgotPasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  ResetPasswordRequest,
  VerifyEmailRequest,
  VerifyLoginRequest,
} from '@base/api/requests/Auth/LoginRequest';
import { HashService } from '../../../infrastructure/services/hash/HashService';
import { EmployeeRepository } from '@base/api/repositories/Employee/EmployeeRepository';
import { NotFoundError, UnauthorizedError } from 'routing-controllers';
import { EmployeeService } from '../Employee/EmployeeService';
import { authConfig } from '@base/config/auth';

@Service()
export class LoginService {
  constructor(
    @InjectRepository() private employeeRepository: EmployeeRepository,
    private authService: AuthService,
    private hashService: HashService,
    private employeeService: EmployeeService,
  ) {}

  public async login(data: LoginRequest) {
    // Find the employee by email, including related role, permissions, settings, and store.
    const employee = await this.employeeRepository.findOne({
      where: { email: data.email },
      relations: ['roles', 'roles.company'] // Include roles and their companies for authorization
    });

    if (!employee || !(await this.hashService.compare(data.password, employee.password))) {
      return {
        success: false,
        statusCode: 401,
        status: 401,
        message: 'Invalid email or password.',
      };
    }

    // Remove password before returning
    const { password, ...employeeWithoutPassword } = employee;

    // Create JWT payload with user information
    const jwtPayload = {
      userId: employee.id,
      email: employee.email,
      role_id: employee.roles?.[0]?.id || null,
      role: employee.roles?.[0]?.name || 'employee',
      roles: employee.roles || [], // Include full roles array with permissions
    };

    // Generate JWT token using AuthService
    const tokenResponse = this.authService.sign(jwtPayload, {
      success: true,
      statusCode: 200,
      status: 200,
      employee: employeeWithoutPassword,
    });

    return tokenResponse;
  }

  /**
   * Refresh a token
   */
  public async refresh(data: RefreshTokenRequest): Promise<object> {
    const isValid = this.authService.verify(data.token) as { employeeId: string };
    if (!isValid) {
      throw new UnauthorizedError('Invalid token.');
    }

    const employee = await this.employeeRepository.findOne({
      where: { email: data.email },
    });

    const { password, ...employeeWithoutPassword } = employee;

    if (!employee) {
      throw new NotFoundError('Employee not found.');
    }

    const newToken = this.authService.sign(
      { ...isValid },
      {
        success: true,
        statusCode: 200,
        status: 200,
        employee: employeeWithoutPassword,
      },
    );
    return { token: newToken };
  }

  /**
   * Logout an employee
   */
  public async logout(data: LoginRequest): Promise<void> {
    // Invalidate the token (if using a token blacklist or similar mechanism)
    // For stateless JWT, this can be a no-op
  }

  /**
   * Forgot password
   */
  public async forgotPassword(data: ForgotPasswordRequest): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { email: data.email } });

    if (!employee) {
      throw new NotFoundError('Employee not found.');
    }

    // Generate a password reset token
    const resetToken = this.authService.sign({ employeeId: employee.id }, { expiresIn: '1h' });

    // Send the reset token via email (implement email service)
    console.log(`Password reset token: ${resetToken}`);
  }

  /**
   * Reset password
   */
  public async resetPassword(data: ResetPasswordRequest): Promise<void> {
    const isValid = this.authService.verify(data.token);
    if (!isValid) {
      throw new UnauthorizedError('Invalid or expired token.');
    }

    const employee = await this.employeeRepository.findOne({ where: { id: (isValid as { employeeId: string }).employeeId } });
    if (!employee) {
      throw new NotFoundError('Employee not found.');
    }

    employee.password = await this.hashService.make(data.password);
    await this.employeeRepository.save(employee);
  }

  /**
   * Verify email
   */
  public async verifyEmail(data: VerifyEmailRequest): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { email: data.email } });

    if (!employee) {
      throw new NotFoundError('Employee not found.');
    }

    // Mark the email as verified
    employee.isEmailVerified = true;
    await this.employeeRepository.save(employee);
  }

  /**
   * Resend verification email
   */
  public async resendVerification(data: VerifyEmailRequest): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { email: data.email } });

    if (!employee) {
      throw new NotFoundError('Employee not found.');
    }

    // Generate a verification token
    const verificationToken = this.authService.sign({ employeeId: employee.id }, { expiresIn: '1h' });

    // Send the verification token via email (implement email service)
    console.log(`Verification token: ${verificationToken}`);
  }

  /**
   * Change password
   */
  public async changePassword(data: ChangePasswordRequest): Promise<void> {
    const employee = await this.employeeRepository.findOne({ where: { email: data.email } });

    if (!employee || !(await this.hashService.compare(data.oldPassword, employee.password))) {
      throw new UnauthorizedError('Invalid current password.');
    }

    employee.password = await this.hashService.make(data.newPassword);
    await this.employeeRepository.save(employee);
  }

  /**
   * Verify login
   */
  public async verifyLogin(data: VerifyLoginRequest): Promise<object> {
    try {
      // Use EmployeeService to get employees by company
      const employee = await this.employeeService.getEmployeeByIdAndCompany(data.employeeId, data.companyId);

      // Check if the employee exists in the company
      if (!employee) {
        throw new NotFoundError('Employee not found in the specified company.');
      }

      // Remove password before returning
      const { password, ...employeeWithoutPassword } = employee;
      (employeeWithoutPassword as any).employeeId = employee.id;

      // Sign a JWT with a payload containing key employee details.
      return this.authService.sign(
        {
          employeeId: employee.id,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          country: employee.country,
          createdAt: employee.createdAt,
          timeLoggedIn: Date().toString(),
          roles: employee.roles || [],
          companies: employee.companies || [],
        },
        {
          success: true,
          statusCode: 200,
          status: 200,
          employee: employeeWithoutPassword,
        },
      );
    } catch (error) {
      console.error('Error in verifyLogin:', error);
      throw error;
    }
  }

  public async validateToken(token: string, companyId?: string): Promise<object> {
    try {
      // Remove "Bearer " prefix if present
      const cleanedToken = token.startsWith('Bearer ') ? token.slice(7) : token;

      const payload = this.authService.verify(cleanedToken) as { employee?: { employeeId?: string } };

      const employeeId = payload?.employee?.employeeId;
     
      if (!employeeId || !companyId) {
        return {
          success: false,
          statusCode: 401,
          status: 401,
          message: 'Invalid token payload.',
        };
      }

      // Check if employee exists in the database
      const employee = await this.employeeRepository.findOne({ where: { id: employeeId } });
      if (!employee) {
        return {
          success: false,
          statusCode: 404,
          status: 404,
          message: 'Employee not found.',
        };
      }

      const company = await this.employeeRepository.manager.getRepository('Company').findOne({ where: { id: companyId } }) as { isActive: boolean } | null;
      if (!company) {
        return {
          success: false,
          statusCode: 404,
          status: 404,
          message: 'Company not found.',
        };
      }
      if (!company.isActive) {
        return {
          success: false,
          statusCode: 403,
          status: 403,
          message: 'Company is not active.',
        };
      }

      return {
        success: true,
        access_token: cleanedToken,
        status: 200,
        payload,
        message: 'Token is valid, employee and company exist, and company is active.',
      };
    } catch (error) {
      return {
        success: false,
        statusCode: 401,
        status: 401,
        message: 'Invalid token.',
      };
    }
  }
}
