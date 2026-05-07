import { Service } from 'typedi';
import { PriceListRepository } from '@api/repositories/Products/PriceListRepository';
import { PriceListNotFoundException } from '@api/exceptions/Products/PriceListNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class PriceListService {
  constructor(
    @InjectRepository() private priceListRepository: PriceListRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.priceListRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedPriceListOrFail(id, resourceOptions, companyId);
  }

  public async create(
    data: {
      name: string;
      description?: string;
      isDefault?: boolean;
      isActive?: boolean;
      items?: Array<{ productId: string; price: number }>;
      extras?: Array<{ serviceExtraId?: string; orderExtraId?: string; price: number }>;
    },
    companyId?: string
  ) {
    const priceList = await this.priceListRepository.createPriceList(data, companyId);

    this.eventDispatcher.dispatch('onPriceListCreate', priceList);

    return priceList;
  }

  public async updateOneById(
    id: string,
    data: {
      name?: string;
      description?: string;
      isDefault?: boolean;
      isActive?: boolean;
      items?: Array<{ productId: string; price: number }>;
      extras?: Array<{ serviceExtraId?: string; orderExtraId?: string; price: number }>;
    },
    companyId?: string
  ) {
    const priceList = await this.getRequestedPriceListOrFail(id, undefined, companyId);

    return await this.priceListRepository.updatePriceList(priceList, data);
  }

  /**
   * Delete a price list and its junction rows.
   *
   * `price_list_products` and `price_list_extras` keep `ON DELETE` set to
   * NO ACTION on the live schema, so the parent delete would fail with a
   * foreign-key error if a list has any items. We clean those up first via
   * raw SQL — same transaction would be safer but `RepositoryBase` doesn't
   * expose one to us; the cleanup is idempotent on retries.
   */
  public async deleteOneById(id: string, companyId?: string) {
    const priceList = companyId
      ? await this.getRequestedPriceListOrFail(id, undefined, companyId)
      : null;

    const targetId = priceList?.id ?? id;

    await this.priceListRepository.manager.query(
      `DELETE FROM price_list_products WHERE price_list_id = $1`,
      [targetId]
    );
    await this.priceListRepository.manager.query(
      `DELETE FROM price_list_extras WHERE price_list_id = $1`,
      [targetId]
    );

    return await this.priceListRepository.delete(targetId);
  }

  private async getRequestedPriceListOrFail(
    id: string,
    resourceOptions?: object,
    companyId?: string
  ) {
    const priceList = await this.priceListRepository.getOneById(id, resourceOptions, companyId);

    if (!priceList) {
      throw new PriceListNotFoundException();
    }

    return priceList;
  }
}
