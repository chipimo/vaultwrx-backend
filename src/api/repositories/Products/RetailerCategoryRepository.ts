import { RetailerCategory } from '@api/models/Products/RetailerCategory';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(RetailerCategory)
export class RetailerCategoryRepository extends RepositoryBase<RetailerCategory> {
  /**
   * Lists all retailer categories for the given company. By default the
   * controller filters this to enabled-only so the products page dropdown
   * doesn't show categories the retailer has turned off.
   */
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('retailerCategory')
        .where('retailerCategory.company_id = :companyId', { companyId })
        .orderBy('retailerCategory.label', 'ASC');

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`retailerCategory.${key} = :${key}`, {
              [key]: filters[key]
            });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`retailerCategory.${sort.field}`, sort.order);
          });
        }
        if (pagination) {
          queryBuilder.skip(pagination.skip).take(pagination.take);
        }
      }

      const [items, count] = await queryBuilder.getManyAndCount();
      return { total_data: count, rows: items };
    }

    return await super.getManyAndCount(resourceOptions);
  }
}
