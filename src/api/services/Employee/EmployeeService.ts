import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { Employee } from '@base/api/models/Store-employee-management/Employee';
import { EmployeeRepository } from '@base/api/repositories/Employee/EmployeeRepository';

@Service()
export class EmployeeService {
  constructor(
    @InjectRepository() private employeeRepository: EmployeeRepository
  ) {}

  public async getAll(companyId?: string): Promise<Employee[]> {
    if (companyId) {
      return await this.employeeRepository.findByCompanyId(companyId);
    }
    return await this.employeeRepository.find();
  }

  public async getAllEmployees(): Promise<Employee[]> {
    return await this.employeeRepository.find();
  }

  public async findOneById(id: string): Promise<Employee | undefined> {
    return await this.employeeRepository.findOne({ where: { id } });
  }

  public async getEmployeeById(id: string): Promise<Employee | undefined> {
    return await this.findOneById(id);
  }

  public async getEmployeeByIdAndCompany(id: string, companyId: string): Promise<Employee | undefined> {
    return await this.employeeRepository.findOne({ where: { id, companyId } });
  }

  public async findByEmail(email: string): Promise<Employee | undefined> {
    return await this.employeeRepository.findByEmail(email);
  }

  public async create(data: Partial<Employee>): Promise<Employee> {
    return await this.employeeRepository.createEmployee(data);
  }

  public async updateOneById(id: string, data: Partial<Employee>): Promise<Employee | undefined> {
    const employee = await this.findOneById(id);
    if (!employee) {
      return undefined;
    }
    Object.assign(employee, data);
    return await this.employeeRepository.save(employee);
  }

  public async deleteOneById(id: string): Promise<boolean> {
    const result = await this.employeeRepository.delete(id);
    return (result.affected || 0) > 0;
  }
}

