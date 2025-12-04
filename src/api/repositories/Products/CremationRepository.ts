import { Cremation } from '@api/models/Products/Cremation';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Cremation)
export class CremationRepository extends RepositoryBase<Cremation> {
  public async getManyAndCount(resourceOptions?: any) {
    const queryBuilder = this.createQueryBuilder('cremation');

    if (resourceOptions) {
      const { filters, sorts, pagination, relations } = resourceOptions;
      
      if (filters) {
        Object.keys(filters).forEach((key) => {
          queryBuilder.andWhere(`cremation.${key} = :${key}`, { [key]: filters[key] });
        });
      }
      
      if (sorts) {
        sorts.forEach((sort: any) => {
          queryBuilder.addOrderBy(`cremation.${sort.field}`, sort.order);
        });
      }
      
      if (pagination) {
        queryBuilder.skip(pagination.skip).take(pagination.take);
      }
      
      if (relations) {
        relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`cremation.${relation}`, relation);
        });
      }
    }

    const [items, count] = await queryBuilder.getManyAndCount();
    return {
      total_data: count,
      rows: items,
    };
  }

  public async getOneById(id: string, resourceOptions?: any) {
    const queryBuilder = this.createQueryBuilder('cremation')
      .where('cremation.id = :id', { id });

    if (resourceOptions?.relations) {
      resourceOptions.relations.forEach((relation: string) => {
        queryBuilder.leftJoinAndSelect(`cremation.${relation}`, relation);
      });
    }

    return await queryBuilder.getOne();
  }

  public async getOneByProductId(productId: string, resourceOptions?: any) {
    const queryBuilder = this.createQueryBuilder('cremation')
      .where('cremation.product_id = :productId', { productId });

    if (resourceOptions?.relations) {
      resourceOptions.relations.forEach((relation: string) => {
        queryBuilder.leftJoinAndSelect(`cremation.${relation}`, relation);
      });
    }

    return await queryBuilder.getOne();
  }

  public async createCremation(data: object) {
    let entity = new Cremation();
    Object.assign(entity, data);
    return await this.save(entity);
  }

  public async updateCremation(cremation: Cremation, data: object) {
    Object.assign(cremation, data);
    return await cremation.save(data);
  }
}

