// resolvers/CustomerResolver.ts
import { Customer } from '@base/api/models/Store-employee-management/Customer';
import { CustomerService } from '@base/api/services/Customer/CustomerService';
import { Resolver, Query, Arg, Int } from 'type-graphql';
import { Service } from 'typedi';

@Service()
@Resolver((of) => Customer)
export class CustomerResolver {
  constructor(private customerService: CustomerService) {}

  @Query((returns) => [Customer])
  public async customers(@Arg('companyId', () => String) companyId: string): Promise<Customer[]> {
    return this.customerService.getAllCustomers(companyId);
  }

  @Query((returns) => Customer, { nullable: true })
  public async customer(@Arg('id', () => String) id: string, @Arg('companyId', () => String) companyId: string): Promise<Customer | undefined> {
    return this.customerService.getCustomerById(id, companyId);
  }
}
