import { Service } from 'typedi';
import { OrderContactRepository } from '@api/repositories/Orders/OrderContactRepository';
import { OrderContactNotFoundException } from '@api/exceptions/Orders/OrderContactNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class OrderContactService {
  constructor(
    @InjectRepository() private orderContactRepository: OrderContactRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.orderContactRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedOrderContactOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let orderContact = await this.orderContactRepository.createOrderContact(data);

    this.eventDispatcher.dispatch('onOrderContactCreate', orderContact);

    return orderContact;
  }

  public async updateOneById(id: number, data: object) {
    const orderContact = await this.getRequestedOrderContactOrFail(id);

    return await this.orderContactRepository.updateOrderContact(orderContact, data);
  }

  public async deleteOneById(id: number) {
    return await this.orderContactRepository.delete(id);
  }

  private async getRequestedOrderContactOrFail(id: number, resourceOptions?: object) {
    let orderContact = await this.orderContactRepository.getOneById(id, resourceOptions);

    if (!orderContact) {
      throw new OrderContactNotFoundException();
    }

    return orderContact;
  }
}

