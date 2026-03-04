import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { OrderHistoryRepository, OrderHistoryFilters, OrderHistoryPagination } from '@api/repositories/Orders/OrderHistoryRepository';
import { OrderHistory } from '@api/models/Orders/OrderHistory';
import { OrderHistoryNotFoundException } from '@api/exceptions/Orders/OrderHistoryNotFoundException';

const MAX_PAGE_SIZE = 100;

@Service()
export class OrderHistoryService {
  constructor(
    @InjectRepository() private orderHistoryRepository: OrderHistoryRepository
  ) {}

  public async getMany(
    companyId: string,
    filters?: OrderHistoryFilters,
    pagination?: OrderHistoryPagination
  ): Promise<{ total_data: number; rows: OrderHistory[] }> {
    const safePagination = this.normalizePagination(pagination);
    return await this.orderHistoryRepository.getHistoryManyAndCount(
      companyId,
      filters,
      safePagination
    );
  }

  public async getOneById(id: string, companyId: string): Promise<OrderHistory> {
    const order = await this.orderHistoryRepository.getHistoryOneById(id, companyId);
    if (!order) {
      throw new OrderHistoryNotFoundException();
    }
    return order;
  }

  public async getOrdersGroupedByDateAndProductType(
    companyId: string,
    orderType?: string,
    pagination?: OrderHistoryPagination
  ): Promise<Array<{ date: string; [key: string]: any }>> {
    const safePagination = this.normalizePagination(pagination);
    return await this.orderHistoryRepository.getOrdersGroupedByDateAndProductType(
      companyId,
      orderType,
      safePagination
    );
  }

  private normalizePagination(pagination?: OrderHistoryPagination): OrderHistoryPagination {
    if (!pagination) return { take: 50 };
    const limit = pagination.limit ?? pagination.take ?? 50;
    const take = Math.min(limit, MAX_PAGE_SIZE);
    const page = pagination.page ?? 1;
    const skip = pagination.skip ?? (page - 1) * take;
    return { skip, take, page, limit: take };
  }
}
