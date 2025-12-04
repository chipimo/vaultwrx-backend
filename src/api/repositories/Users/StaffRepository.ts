import { Staff } from '@api/models/Users/Staff';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Staff)
export class StaffRepository extends RepositoryBase<Staff> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('staff')
        .where('staff.company_id = :companyId', { companyId });

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`staff.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`staff.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
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
      const queryBuilder = this.createQueryBuilder('staff')
        .where('staff.id = :id', { id })
        .andWhere('staff.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`staff.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createStaff(data: object, companyId?: string) {
    let entity = new Staff();

    Object.assign(entity, data);

    // Set company_id if provided
    if (companyId) {
      entity.company_id = companyId;
    }

    return await this.save(entity);
  }

  public async updateStaff(staff: Staff, data: object) {
    Object.assign(staff, data);

    return await staff.save(data);
  }
}

