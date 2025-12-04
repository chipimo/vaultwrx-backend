import { Product, ProductType } from '@api/models/Products/Product';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Retailer } from '@api/models/Users/Retailer';
import { Company } from '@api/models/Company/Company';

@EntityRepository(Product)
export class ProductRepository extends RepositoryBase<Product> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      // Filter products by company using direct company_id
      const queryBuilder = this.createQueryBuilder('product')
        .where('product.company_id = :companyId', { companyId });

      if (resourceOptions) {
        // Apply resource options if provided
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`product.${sort.field}`, sort.order);
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
      // Filter products by company using direct company_id
      const queryBuilder = this.createQueryBuilder('product')
        .where('product.id = :id', { id })
        .andWhere('product.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`product.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createProduct(data: object, companyId?: string) {
    let entity = new Product();

    Object.assign(entity, data);

    // Set company_id if provided
    if (companyId) {
      entity.companyId = companyId;
      
      // If retailerId is not provided, find the retailer for this company
      if (!entity.retailerId) {
        const company = await this.manager.findOne(Company, {
          where: { id: companyId },
        });
        if (company && company.retailer_id) {
          entity.retailerId = company.retailer_id;
        }
      } else {
        // If retailerId is provided, ensure the retailer belongs to that company
        const company = await this.manager.findOne(Company, {
          where: { id: companyId },
        });
        if (company && company.retailer_id !== entity.retailerId) {
          throw new Error('Retailer does not belong to the specified company');
        }
      }
    }

    return await this.save(entity);
  }

  public async updateProduct(product: Product, data: object) {
    Object.assign(product, data);

    return await product.save(data);
  }

  /**
   * Get products grouped by product type
   * Returns an object with product types as keys and arrays of products as values
   */
  public async getProductsGroupedByType(companyId?: string, resourceOptions?: any) {
    const queryBuilder = this.createQueryBuilder('product')
      .leftJoinAndSelect('product.company', 'company')
      .leftJoinAndSelect('product.retailer', 'retailer')
      .where('product.is_active = :isActive', { isActive: true });

    if (companyId) {
      queryBuilder.andWhere('product.company_id = :companyId', { companyId });
    }

    // Apply additional filters if provided
    if (resourceOptions?.filters) {
      const { filters } = resourceOptions;
      Object.keys(filters).forEach((key) => {
        if (key !== 'type') { // Don't filter by type since we're grouping by it
          queryBuilder.andWhere(`product.${key} = :${key}`, { [key]: filters[key] });
        }
      });
    }

    // Apply sorting if provided
    if (resourceOptions?.sorts) {
      resourceOptions.sorts.forEach((sort: any) => {
        queryBuilder.addOrderBy(`product.${sort.field}`, sort.order);
      });
    }

    const products = await queryBuilder.getMany();

    // Group products by type
    const grouped: Record<string, Product[]> = {
      vaults: [],
      caskets: [],
      urns: [],
      grave_diggings: [],
      cremations: [],
      monuments: [],
      bulk_precasts: [],
    };

    products.forEach((product) => {
      if (product.type) {
        const typeKey = product.type.toLowerCase();
        // Map enum values to the keys we want in the response (plural forms)
        const keyMap: Record<string, string> = {
          vault: 'vaults',
          casket: 'caskets',
          urn: 'urns',
          grave_digging: 'grave_diggings',
          cremation: 'cremations',
          monument: 'monuments',
          bulk_precast: 'bulk_precasts',
        };

        const mappedKey = keyMap[typeKey] || typeKey;
        if (grouped[mappedKey]) {
          grouped[mappedKey].push(product);
        }
      }
    });

    return grouped;
  }
}

