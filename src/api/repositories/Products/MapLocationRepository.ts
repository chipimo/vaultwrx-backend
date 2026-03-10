import { MapLocation } from '@api/models/Products/MapLocation';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';
import { Company } from '@api/models/Company/Company';

@EntityRepository(MapLocation)
export class MapLocationRepository extends RepositoryBase<MapLocation> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    if (companyId) {
      const queryBuilder = this.createQueryBuilder('map_location')
        .where('map_location.company_id = :companyId', { companyId });

      if (resourceOptions) {
        const { filters, sorts, pagination } = resourceOptions;
        if (filters) {
          Object.keys(filters).forEach((key) => {
            queryBuilder.andWhere(`map_location.${key} = :${key}`, { [key]: filters[key] });
          });
        }
        if (sorts) {
          sorts.forEach((sort: any) => {
            queryBuilder.addOrderBy(`map_location.${sort.field}`, sort.order);
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
      const queryBuilder = this.createQueryBuilder('map_location')
        .where('map_location.id = :id', { id })
        .andWhere('map_location.company_id = :companyId', { companyId });

      if (resourceOptions?.relations) {
        resourceOptions.relations.forEach((relation: string) => {
          queryBuilder.leftJoinAndSelect(`map_location.${relation}`, relation);
        });
      }

      return await queryBuilder.getOne();
    }

    return await super.getOneById(id as any, resourceOptions);
  }

  public async createMapLocation(data: object, companyId?: string) {
    const entityData: Partial<MapLocation> = { ...data as Partial<MapLocation> };

    if (companyId) {
      entityData.companyId = companyId;
      if (!entityData.retailerId) {
        const company = await this.manager.findOne(Company, {
          where: { id: companyId },
        });
        if (company && company.retailer_id) {
          entityData.retailerId = company.retailer_id;
        }
      }
    }

    if (entityData.isActive === undefined) {
      entityData.isActive = true;
    }
    if (entityData.isDefault === undefined) {
      entityData.isDefault = false;
    }

    const result = await this.createQueryBuilder()
      .insert()
      .into(MapLocation)
      .values(entityData)
      .returning('*')
      .execute();

    return result.generatedMaps[0] as MapLocation;
  }

  public async updateMapLocation(mapLocation: MapLocation, data: object) {
    await this.createQueryBuilder()
      .update(MapLocation)
      .set(data)
      .where('id = :id', { id: mapLocation.id })
      .execute();

    return await this.findOne({ where: { id: mapLocation.id } });
  }
}
