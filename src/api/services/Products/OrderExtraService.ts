import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { OrderExtraRepository } from '@api/repositories/Products/OrderExtraRepository';
import { OrderExtraNotFoundException } from '@api/exceptions/Products/OrderExtraNotFoundException';

@Service()
export class OrderExtraService {
  constructor(@InjectRepository() private orderExtraRepository: OrderExtraRepository) {}

  public async getAll(
    resourceOptions?: object,
    companyId?: string,
    extra?: { categoryId?: string; skip?: number; take?: number }
  ) {
    return await this.orderExtraRepository.getManyAndCount(resourceOptions, companyId, extra);
  }

  public async findOneById(id: string, companyId?: string) {
    return await this.orderExtraRepository.getOneById(id, undefined, companyId);
  }

  public async create(
    data: { name: string; categoryId: string; description?: string; price: number; isActive?: boolean },
    companyId: string
  ) {
    return await this.orderExtraRepository.createOrderExtra(data, companyId);
  }

  /**
   * Delete an order-extra template and clear any price-list links so it
   * disappears from the master and any other price list it was on.
   */
  public async deleteOneById(id: string, companyId?: string) {
    const orderExtra = await this.orderExtraRepository.getOneById(
      id,
      undefined,
      companyId
    );
    if (!orderExtra) {
      throw new OrderExtraNotFoundException();
    }

    await this.orderExtraRepository.manager.query(
      `DELETE FROM price_list_extras WHERE order_extra_id = $1`,
      [orderExtra.id]
    );

    return await this.orderExtraRepository.delete(orderExtra.id);
  }
}
