import { EntityRepository, Repository } from 'typeorm';
import { Employee } from '@base/api/models/Store-employee-management/Employee';

@EntityRepository(Employee)
export class EmployeeRepository extends Repository<Employee> {
  public async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const entity = this.create(data);
    return await this.save(entity);
  }

  public async findByEmail(email: string): Promise<Employee | undefined> {
    return await this.findOne({ where: { email } });
  }

  public async findByCompanyId(companyId: string): Promise<Employee[]> {
    return await this.find({ where: { companyId } });
  }
}

