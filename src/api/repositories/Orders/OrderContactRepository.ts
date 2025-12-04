import { OrderContact } from '@api/models/Orders/OrderContact';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(OrderContact)
export class OrderContactRepository extends RepositoryBase<OrderContact> {
  public async createOrderContact(data: object) {
    let entity = new OrderContact();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateOrderContact(orderContact: OrderContact, data: object) {
    Object.assign(orderContact, data);

    return await orderContact.save(data);
  }
}

