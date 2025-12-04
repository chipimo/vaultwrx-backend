import { Customer } from '@api/models/Users/Customer';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Customer)
export class CustomerRepository extends RepositoryBase<Customer> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('customer')
        .where('customer.company_id = :companyId', { companyId });

      if (resourceOptions) {
        const { filters, sorts, pagination, relations } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`customer.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`customer.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
        }
        if (relations) {
          relations.forEach((relation: string) => {
            queryBuilder.leftJoinAndSelect(`customer.${relation}`, relation);
          });
        }
      }

      const [items, count] = await queryBuilder.getManyAndCount();
      // Return in the same format as the base class
      return {
        total_data: count,
        rows: items,
      };
    }

    return await super.getManyAndCount(resourceOptions);
  }

  public async getOneById(id: string, resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('customer')
        .where('customer.id = :id', { id })
        .andWhere('customer.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`customer.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createCustomer(data: object, companyId?: string) {
    let entity = new Customer();

    Object.assign(entity, data);

    // Set company_id if provided
    if (companyId) {
      entity.company_id = companyId;
    }

    return await this.save(entity);
  }

  public async updateCustomer(customer: Customer, data: object) {
    Object.assign(customer, data);

    return await customer.save(data);
  }
}

