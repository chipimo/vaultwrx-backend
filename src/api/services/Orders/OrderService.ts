import { Service } from 'typedi';
import { OrderRepository } from '@api/repositories/Orders/OrderRepository';
import { OrderNotFoundException } from '@api/exceptions/Orders/OrderNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { ProductType } from '@api/models/Products/Product';
import { ProductType as OrderProductType, Gender, CremationType, WitnessType, GraveType } from '@base/api/models/Sales-and-orders/OrderItem';
import { PhotoType } from '@base/api/models/Sales-and-orders/Photo';

// Request interfaces for order creation
export interface CreateOrderItemRequest {
  productId?: string;
  productType?: OrderProductType;
  quantity?: number;
  unitPrice?: number;
  cremationType?: CremationType;
  witnessType?: WitnessType;
  lastDayLettering?: boolean;
  graveType?: GraveType;
  gender?: Gender;
  deliverBy?: string;
  serviceDate?: string;
  deliveryTime?: string;
  serviceTime?: string;
  engraving?: string;
  customization?: string;
}

export interface CreateDeceasedRequest {
  name?: string;
  birthDate?: string;
  deathDate?: string;
  gender?: Gender;
  height?: string;
  weight?: string;
}

export interface CreatePhotoRequest {
  url?: string;
  type?: PhotoType;
  fileSize?: number;
  mimeType?: string;
}

export interface CreateOrderRequest {
  customerId?: string;
  retailerId?: string;
  deceased?: CreateDeceasedRequest;
  orderItems?: CreateOrderItemRequest[];
  photos?: CreatePhotoRequest[];
  dateOfService?: string;
  timeOfService?: string;
  arrivalTime?: string;
  email?: string;
  cellPhone?: string;
}

@Service()
export class OrderService {
  constructor(
    @InjectRepository() private orderRepository: OrderRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
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
    productType?: ProductType | 'all'
  ) {
    return await this.orderRepository.getOrdersGroupedByDateAndProductType(
      companyId,
      resourceOptions,
      productType
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
    let order = await this.orderRepository.getOneById(id, resourceOptions, companyId);

    if (!order) {
      throw new OrderNotFoundException();
    }

    return order;
  }
}

