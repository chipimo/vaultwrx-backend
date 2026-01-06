// resolvers/EmployeeResolver.ts
import { Employee } from '@base/api/models/Store-employee-management/Employee';
import { EmployeeService } from '@base/api/services/Employee/EmployeeService';
import { Resolver, Query, Arg, Int } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver(of => Employee)
export class EmployeeResolver {
  constructor(private employeeService: EmployeeService) {}

  @Query(returns => [Employee])
  public async employees(): Promise<Employee[]> {
    return this.employeeService.getAllEmployees();
  }

  @Query(returns => Employee, { nullable: true })
  public async employee(@Arg('id', type => Int) id: string): Promise<Employee | undefined> {
    return this.employeeService.getEmployeeById(id);
  }
}