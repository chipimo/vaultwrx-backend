import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { CustomerRepository } from '@base/api/repositories/Customer/CustomerRepository';
import { CustomerPasswordResetRequest } from '@base/api/requests/Auth/CustomerPasswordResetRequest';
import { CustomerChangePasswordRequest } from '@base/api/requests/Auth/CustomerChangePasswordRequest';
import { HashService } from '@base/infrastructure/services/hash/HashService';
import { MailService } from '@base/infrastructure/services/mail/MailService';
import { BadRequestError, NotFoundError, UnauthorizedError } from 'routing-controllers';
import { v4 as uuidv4 } from 'uuid';

@Service()
export class CustomerPasswordResetService {
  constructor(
    @InjectRepository() private customerRepository: CustomerRepository,
    private hashService: HashService,
    private mailService: MailService
  ) {}

  /**
   * ✅ Request password reset
   */
  public async requestPasswordReset(data: CustomerPasswordResetRequest): Promise<{ message: string }> {
    // Find customer by email
    const customer = await this.customerRepository.findByEmail(data.email);
    if (!customer) {
      // Don't reveal if email exists or not for security
      return {
        message: 'If the email exists, a password reset link has been sent.',
      };
    }

    // Generate reset token
    const resetToken = uuidv4();
    const resetTokenExpiry = new Date();
    resetTokenExpiry.setHours(resetTokenExpiry.getHours() + 1); // Token expires in 1 hour

    // Store reset token in customer record (you might want to create a separate table for this)
    await this.customerRepository.updateCustomer(customer, {
      // You might want to add these fields to the Customer model
      // resetToken,
      // resetTokenExpiry,
    });

    // Send password reset email
    try {
      await this.mailService
        .from('noreply@accounting-assistant.com')
        .to(customer.email)
        .subject('Password Reset Request')
        .html(`<p>Click the link below to reset your password:</p><p><a href="${process.env.FRONTEND_URL || 'http://localhost:3001'}/reset-password?token=${resetToken}">Reset Password</a></p>`)
        .send();
    } catch (error) {
      console.error('Failed to send password reset email:', error);
      // Don't throw error to avoid revealing email existence
    }

    return {
      message: 'If the email exists, a password reset link has been sent.',
    };
  }

  /**
   * ✅ Reset password with token
   */
  public async resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
    // Find customer by reset token
    const customer = await this.customerRepository.findOne({
      where: {
        // resetToken: token,
        // resetTokenExpiry: MoreThan(new Date()),
      },
    });

    if (!customer) {
      throw new BadRequestError('Invalid or expired reset token');
    }

    // Hash new password
    const hashedPassword = await this.hashService.make(newPassword);

    // Update customer password and clear reset token
    await this.customerRepository.updateCustomer(customer, {
      password: hashedPassword,
      // resetToken: null,
      // resetTokenExpiry: null,
    });

    return {
      message: 'Password has been successfully reset',
    };
  }

  /**
   * ✅ Change password (for authenticated customers)
   */
  public async changePassword(customerId: string, data: CustomerChangePasswordRequest): Promise<{ message: string }> {
    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Verify current password
    if (!customer.password) {
      throw new BadRequestError('Customer has no password set');
    }

    const isCurrentPasswordValid = await this.hashService.compare(data.currentPassword, customer.password);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedError('Current password is incorrect');
    }

    // Validate new password confirmation
    if (data.newPassword !== data.confirmPassword) {
      throw new BadRequestError('New password and confirmation do not match');
    }

    // Hash and update password
    const hashedNewPassword = await this.hashService.make(data.newPassword);
    await this.customerRepository.updateCustomer(customer, { password: hashedNewPassword });

    return {
      message: 'Password has been successfully changed',
    };
  }
}

