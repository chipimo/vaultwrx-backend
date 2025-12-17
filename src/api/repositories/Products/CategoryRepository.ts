import { Category } from '@api/models/Products/Category';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(Category)
export class CategoryRepository extends RepositoryBase<Category> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('category')
        .where('category.company_id = :companyId', { companyId });

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`category.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`category.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
        }
      }

      queryBuilder.addOrderBy('category.sortOrder', 'ASC');

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
      const queryBuilder = this.createQueryBuilder('category')
        .where('category.id = :id', { id })
        .andWhere('category.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`category.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createCategory(data: object, companyId?: string) {
    let entity = new Category();

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

  public async updateCategory(category: Category, data: object) {
    Object.assign(category, data);

    return await category.save(data);
  }
}

