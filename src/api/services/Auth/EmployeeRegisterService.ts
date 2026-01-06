import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { AuthService } from '@base/infrastructure/services/auth/AuthService';
import { EmployeeRepository } from '@base/api/repositories/Employee/EmployeeRepository';
import { RegisterEmployeeRequest } from '@base/api/requests/Auth/RegisterEmployeeRequest';

@Service()
export class EmployeeRegisterService {
  constructor(
    @InjectRepository() private employeeRepository: EmployeeRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private authService: AuthService,
  ) {}

  public async register(data: RegisterEmployeeRequest): Promise<object> {
    // Create a new employee record
    let employee = await this.employeeRepository.createEmployee(data);

    // Reload the employee record with related role, store, and settings
    employee = await this.employeeRepository.findOne({
      where: { id: employee.id },
      // relations: ['role', 'store', 'settings'],?\
    });

    // Dispatch a registration event for any post-registration actions (e.g., welcome email)
    this.eventDispatcher.dispatch('onEmployeeRegister', employee);

    // Sign a JWT with key employee details
    return this.authService.sign(
      {
        employeeId: employee.id,
        email: employee.email,
      },
      {
        employee: {
          id: employee.id,
          employeeId: employee.id,
          email: employee.email,
          firstName: employee.firstName,
          lastName: employee.lastName,
          profileImageUrl: employee.profileImageUrl,
        },
      },
    );
  }
}