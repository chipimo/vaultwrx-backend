import { AuditLog } from '@api/models/Audit/AuditLog';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(AuditLog)
export class AuditLogRepository extends RepositoryBase<AuditLog> {
  public async getManyAndCount(resourceOptions?: any, companyId?: string) {
    const queryBuilder = this.createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.company', 'company')
      .leftJoinAndSelect('auditLog.user', 'user');

    if (companyId) {
      queryBuilder.where('auditLog.company_id = :companyId', { companyId });
    }

    if (resourceOptions) {
      const { filters, sorts, pagination } = resourceOptions;

      if (filters) {
        Object.keys(filters).forEach((key) => {
          queryBuilder.andWhere(`auditLog.${key} = :${key}`, { [key]: filters[key] });
        });
      }

      if (sorts) {
        sorts.forEach((sort: any) => {
          queryBuilder.addOrderBy(`auditLog.${sort.field}`, sort.order);
        });
      }

      if (pagination) {
        queryBuilder.skip(pagination.skip).take(pagination.take);
      }
    }

    // Default sort by created_at descending if no sort specified
    if (!resourceOptions?.sorts || resourceOptions.sorts.length === 0) {
      queryBuilder.addOrderBy('auditLog.created_at', 'DESC');
    }

    const [items, count] = await queryBuilder.getManyAndCount();

    return {
      total_data: count,
      rows: items,
    };
  }

  public async getOneById(id: string, resourceOptions?: any, companyId?: string) {
    const queryBuilder = this.createQueryBuilder('auditLog')
      .leftJoinAndSelect('auditLog.company', 'company')
      .leftJoinAndSelect('auditLog.user', 'user')
      .where('auditLog.id = :id', { id });

    if (companyId) {
      queryBuilder.andWhere('auditLog.company_id = :companyId', { companyId });
    }

    if (resourceOptions?.relations) {
      resourceOptions.relations.forEach((relation: string) => {
        const existingJoin = queryBuilder.expressionMap.joinAttributes.find(
          ja => ja.alias.name === relation || ja.alias.name === `auditLog.${relation}`
        );
        if (!existingJoin) {
          queryBuilder.leftJoinAndSelect(`auditLog.${relation}`, relation);
        }
      });
    }

    return await queryBuilder.getOne();
  }
}

