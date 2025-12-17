import { Emblem } from '@api/models/Products/Emblem';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(Emblem)
export class EmblemRepository extends RepositoryBase<Emblem> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('emblem')
        .where('emblem.company_id = :companyId', { companyId });

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`emblem.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`emblem.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
        }
      }

      const [items, count] = await queryBuilder.getManyAndCount();
      return {
        total_data: count,
        rows: items,
      };
    }

    return await super.getManyAndCount(resourceOptions);
  }

  public async getOneById(id: string, resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('emblem')
        .where('emblem.id = :id', { id })
        .andWhere('emblem.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`emblem.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createEmblem(data: object, companyId?: string) {
    let entity = new Emblem();

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

  public async updateEmblem(emblem: Emblem, data: object) {
    Object.assign(emblem, data);

    return await emblem.save(data);
  }
}

