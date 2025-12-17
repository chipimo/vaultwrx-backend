import { Service } from 'typedi';
import { UserRepository } from '@api/repositories/Users/UserRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { InvalidCredentials } from '@api/exceptions/Auth/InvalidCredentials';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import { LoginRequest } from '@base/api/requests/Auth/LoginRequest';
import { HashService } from '@base/infrastructure/services/hash/HashService';
import { User } from '@api/models/Users/User';

// User type enum for the response
export enum UserType {
  ADMIN = 'admin',
  RETAILER = 'retailer',
  CUSTOMER = 'customer',
  STAFF = 'staff',
  FUNERAL_DIRECTOR = 'funeral_director',
  UNKNOWN = 'unknown',
}

@Service()
export class LoginService {
  constructor(
    @InjectRepository() private userRepository: UserRepository,
    private authService: AuthService,
    private hashService: HashService
  ) {}

  public async login(data: LoginRequest) {
    let user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: [
        'role',
        'role.permissions',
        'company',
        'retailer',
        'retailer.company',
        'customer',
        'staff',
        'funeralDirector',
        'admin',
      ],
    });

    if (!user) {
      throw new InvalidCredentials();
    }

    if (!user.isActive) {
      throw new InvalidCredentials();
    }

    if (!(await this.hashService.compare(data.password, user.password))) {
      throw new InvalidCredentials();
    }

    // Determine user type based on relationships
    const userType = this.determineUserType(user);

    // Map permissions to a simpler format
    const permissions = user.role?.permissions?.map((perm) => ({
      resource: perm.resource,
      action: perm.action,
    })) || [];

    // For retailers, get their owned company ID (through retailer.company)
    const ownedCompanyId = user.role?.type === 'retailer' && user.retailer?.company 
      ? user.retailer.company.id 
      : null;
    
    // Use owned company ID for retailers, otherwise use regular company_id
    const companyId = ownedCompanyId || user.company_id;

    // Build user response with type-specific data
    const userResponse: any = {
      id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      full_name: user.fullName,
      email: user.email,
      role: user.role.name,
      roleType: user.role.type,
      userType: userType,
      company_id: companyId,
      owned_company_id: ownedCompanyId,
      company: user.company ? {
        id: user.company.id,
        name: user.company.name,
      } : null,
      permissions: permissions,
      
      admin: null,
      retailer: null,
      customer: null,
      staff: null,
      funeralDirector: null,
    };

    // Populate the specific user type data
    if (user.admin) {
      userResponse.admin = {
        id: user.admin.id,
      };
    }
    if (user.retailer) {
      userResponse.retailer = {
        id: user.retailer.id,
        company: user.retailer.company ? {
          id: user.retailer.company.id,
          name: user.retailer.company.name,
        } : null,
      };
    }
    if (user.customer) {
      userResponse.customer = {
        id: user.customer.id,
        phone: user.customer.phone,
        address: user.customer.address,
        city: user.customer.city,
        state: user.customer.state,
        zipCode: user.customer.zipCode,
      };
    }
    if (user.staff) {
      userResponse.staff = {
        id: user.staff.id,
        employeeId: user.staff.employeeId,
        department: user.staff.department,
        position: user.staff.position,
      };
    }
    if (user.funeralDirector) {
      userResponse.funeralDirector = {
        id: user.funeralDirector.id,
        licenseNumber: user.funeralDirector.licenseNumber,
        specialization: user.funeralDirector.specialization,
        isVerified: user.funeralDirector.isVerified,
      };
    }

    return this.authService.sign(
      {
        userId: user.id,
        email: user.email,
        role_id: user.role_id,
        role: user.role.name,
        roleType: user.role.type,
        userType: userType,
        company_id: companyId,
        owned_company_id: ownedCompanyId,
        parent_user_id: user.parent_user_id,
        permissions: permissions,
      },
      {
        user: userResponse,
      },
    );
  }

  private determineUserType(user: User): UserType {
    if (user.admin) {
      return UserType.ADMIN;
    }
    if (user.retailer) {
      return UserType.RETAILER;
    }
    if (user.customer) {
      return UserType.CUSTOMER;
    }
    if (user.staff) {
      return UserType.STAFF;
    }
    if (user.funeralDirector) {
      return UserType.FUNERAL_DIRECTOR;
    }
    return UserType.UNKNOWN;
  }

}
