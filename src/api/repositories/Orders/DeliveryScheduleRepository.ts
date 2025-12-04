import { DeliverySchedule } from '@api/models/Orders/DeliverySchedule';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(DeliverySchedule)
export class DeliveryScheduleRepository extends RepositoryBase<DeliverySchedule> {
  public async createDeliverySchedule(data: object) {
    let entity = new DeliverySchedule();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateDeliverySchedule(deliverySchedule: DeliverySchedule, data: object) {
    Object.assign(deliverySchedule, data);

    return await deliverySchedule.save(data);
  }
}

