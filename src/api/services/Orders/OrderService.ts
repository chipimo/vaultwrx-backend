import { Service } from 'typedi';
import { OrderRepository } from '@api/repositories/Orders/OrderRepository';
import { OrderNotFoundException } from '@api/exceptions/Orders/OrderNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ProductType } from '@api/models/Products/Product';
import { OrderHistoryService } from '@api/services/Orders/OrderHistoryService';

@Service()
export class OrderService {
  constructor(
    @InjectRepository() private orderRepository: OrderRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
    private orderHistoryService: OrderHistoryService
  ) {}

  public async getAll(resourceOptions?: any, companyId?: string) {
    return await this.orderRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async getAllByProductType(
    productType: ProductType,
    resourceOptions?: any,
    companyId?: string
  ) {
    return await this.orderRepository.getManyAndCountByProductType(
      productType,
      resourceOptions,
      companyId
    );
  }

  public async getOrdersGroupedByDateAndProductType(
    resourceOptions?: any,
    companyId?: string,
    productType?: ProductType | 'all',
    orderStatus?: string
  ) {
    return await this.orderRepository.getOrdersGroupedByDateAndProductType(
      companyId,
      resourceOptions,
      productType,
      orderStatus
    );
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedOrderOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string, user?: any) {
    let order = await this.orderRepository.createOrder(data, companyId, user);

    this.eventDispatcher.dispatch('onOrderCreate', order);

    return order;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const order = await this.getRequestedOrderOrFail(id, undefined, companyId);

    return await this.orderRepository.updateOrder(order, data, companyId);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const order = await this.getRequestedOrderOrFail(id, undefined, companyId);
      return await this.orderRepository.delete(order.id);
    }
    return await this.orderRepository.delete(id);
  }

  private async getRequestedOrderOrFail(id: string, resourceOptions?: object, companyId?: string) {
    const order = await this.orderRepository.getOneById(id, resourceOptions, companyId);
    if (order) {
      return order;
    }
    try {
      return await this.orderHistoryService.getOneById(id, companyId!);
    } catch {
      throw new OrderNotFoundException();
    }
  }
}

