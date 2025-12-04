import { ServiceExtra } from '@api/models/Products/ServiceExtra';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(ServiceExtra)
export class ServiceExtraRepository extends RepositoryBase<ServiceExtra> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('serviceExtra')
        .where('serviceExtra.company_id = :companyId', { companyId });

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`serviceExtra.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`serviceExtra.${sort.field}`, sort.order);
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
      const queryBuilder = this.createQueryBuilder('serviceExtra')
        .where('serviceExtra.id = :id', { id })
        .andWhere('serviceExtra.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`serviceExtra.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createServiceExtra(data: object, companyId?: string) {
    let entity = new ServiceExtra();

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

  public async updateServiceExtra(serviceExtra: ServiceExtra, data: object) {
    Object.assign(serviceExtra, data);

    return await serviceExtra.save(data);
  }
}

