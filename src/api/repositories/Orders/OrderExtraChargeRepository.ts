import { OrderExtraCharge } from '@api/models/Orders/OrderExtraCharge';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(OrderExtraCharge)
export class OrderExtraChargeRepository extends RepositoryBase<OrderExtraCharge> {
  public async createOrderExtraCharge(data: object) {
    let entity = new OrderExtraCharge();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateOrderExtraCharge(orderExtraCharge: OrderExtraCharge, data: object) {
    Object.assign(orderExtraCharge, data);

    return await orderExtraCharge.save(data);
  }
}

