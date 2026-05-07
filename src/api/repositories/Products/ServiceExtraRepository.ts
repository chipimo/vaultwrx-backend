import { ServiceExtra } from '@api/models/Products/ServiceExtra';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(ServiceExtra)
export class ServiceExtraRepository extends RepositoryBase<ServiceExtra> {
  /**
   * `extra` lets the controller pass scoped filters that came in as direct
   * query params (e.g. `?category=Urns`), bypassing the unreliable parser.
   */
  public async getManyAndCount(
    resourceOptions?: any,
    companyId?: string,
    extra?: { category?: string; skip?: number; take?: number }
  ) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('serviceExtra')
        .where('serviceExtra.company_id = :companyId', { companyId });

      if (extra?.category) {
        queryBuilder.andWhere('serviceExtra.category = :category', {
          category: extra.category,
        });
      }

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters && !Array.isArray(filters)) {
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

      if (extra?.skip !== undefined) queryBuilder.skip(extra.skip);
      if (extra?.take !== undefined) queryBuilder.take(extra.take);

      const [items, count] = await queryBuilder.getManyAndCount();

      // Attach the price lists each service-extra is linked to (via the
      // price_list_extras junction). Done as a single grouped query so the
      // table can render a Price Lists popover without an N+1 fetch.
      await this.attachPriceLists(items);

      return {
        total_data: count,
        rows: items,
      };
    }

    return await super.getManyAndCount(resourceOptions);
  }

  /**
   * For each row in `items`, attach a `priceLists` array of
   * `{ id, name, price, isDefault }` taken from `price_list_extras` joined
   * with `price_lists`. Mutates rows in place.
   */
  private async attachPriceLists(items: ServiceExtra[]): Promise<void> {
    if (items.length === 0) return;
    const ids = items.map((i) => i.id);
    const rows: Array<{
      item_id: string;
      id: string;
      name: string;
      price: string;
      is_default: boolean;
    }> = await this.manager.query(
      `SELECT ple.service_extra_id AS item_id,
              pl.id, pl.name, ple.price, pl.is_default
         FROM price_list_extras ple
         JOIN price_lists pl ON pl.id = ple.price_list_id
        WHERE ple.service_extra_id = ANY($1)
        ORDER BY pl.is_default DESC, pl.name ASC`,
      [ids]
    );

    const byItem = new Map<string, Array<{ id: string; name: string; price: number; isDefault: boolean }>>();
    for (const r of rows) {
      const arr = byItem.get(r.item_id) ?? [];
      arr.push({
        id: r.id,
        name: r.name,
        price: Number(r.price ?? 0),
        isDefault: Boolean(r.is_default),
      });
      byItem.set(r.item_id, arr);
    }

    for (const item of items) {
      (item as any).priceLists = byItem.get(item.id) ?? [];
    }
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

    const saved = await this.save(entity);

    // Auto-link the new service extra to the retailer's default price list
    // with its standard price. Same convention as products + order-extras
    // so every new item ships in the Master list by default.
    if (saved.retailerId) {
      try {
        const master = await this.manager.query(
          `SELECT id FROM price_lists
            WHERE retailer_id = $1 AND is_default = true AND is_active = true
            LIMIT 1`,
          [saved.retailerId]
        );
        const masterId = master?.[0]?.id;
        const price = Number(saved.price ?? 0) || 0;
        if (masterId) {
          await this.manager.query(
            `INSERT INTO price_list_extras (id, price_list_id, service_extra_id, order_extra_id, price, created_at, updated_at)
             VALUES (uuid_generate_v4(), $1, $2, NULL, $3, NOW(), NOW())`,
            [masterId, saved.id, price]
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn('[ServiceExtraRepository] failed to auto-link to master price list', err);
      }
    }

    return saved;
  }

  public async updateServiceExtra(serviceExtra: ServiceExtra, data: object) {
    Object.assign(serviceExtra, data);

    return await serviceExtra.save(data);
  }
}

