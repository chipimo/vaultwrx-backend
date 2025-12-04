import { Location } from '@api/models/Products/Location';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(Location)
export class LocationRepository extends RepositoryBase<Location> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('location')
        .where('location.company_id = :companyId', { companyId });

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`location.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`location.${sort.field}`, sort.order);
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
      const queryBuilder = this.createQueryBuilder('location')
        .where('location.id = :id', { id })
        .andWhere('location.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`location.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createLocation(data: object, companyId?: string) {
    let entity = new Location();

    Object.assign(entity, data);

    if (companyId) {
      entity.companyId = companyId;
      if (!entity.retailerId) {
        const company = await this.manager.findOne(Company, {
          where: { id: companyId },
        });
        if (company && company.retailer_id) {
          entity.retailerId = company.retailer_id;
        }
      }
    }

    return await this.save(entity);
  }

  public async updateLocation(location: Location, data: object) {
    Object.assign(location, data);

    return await location.save(data);
  }
}

