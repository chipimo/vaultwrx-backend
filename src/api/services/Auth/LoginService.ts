import { Service } from 'typedi';
import { UserRepository } from '@api/repositories/Users/UserRepository';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { InvalidCredentials } from '@api/exceptions/Auth/InvalidCredentials';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import { LoginRequest } from '@base/api/requests/Auth/LoginRequest';
import { HashService } from '@base/infrastructure/services/hash/HashService';

@Service()
export class LoginService {
  constructor(@InjectRepository() private userRepository: UserRepository, private authService: AuthService, private hashService: HashService) {
    //
  }

  public async login(data: LoginRequest) {
    let user = await this.userRepository.findOne({
      where: { email: data.email },
      relations: ['role', 'role.permissions', 'company', 'retailer', 'retailer.company'],
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

    return this.authService.sign(
      {
        userId: user.id,
        email: user.email,
        role_id: user.role_id,
        role: user.role.name,
        roleType: user.role.type,
        company_id: companyId,
        owned_company_id: ownedCompanyId,
        parent_user_id: user.parent_user_id,
        permissions: permissions,
      },
      {
        user: {
          id: user.id,
          email: user.email,
          role: user.role.name,
          roleType: user.role.type,
          company_id: companyId,
          owned_company_id: ownedCompanyId,
          permissions: permissions,
        },
      },
    );
  }
}
