import { Service } from 'typedi';
import { RetailerRepository } from '@api/repositories/Users/RetailerRepository';
import { RetailerNotFoundException } from '@api/exceptions/Users/RetailerNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class RetailerService {
  constructor(
    @InjectRepository() private retailerRepository: RetailerRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.retailerRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedRetailerOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let retailer = await this.retailerRepository.createRetailer(data);

    this.eventDispatcher.dispatch('onRetailerCreate', retailer);

    return retailer;
  }

  public async updateOneById(id: number, data: object) {
    const retailer = await this.getRequestedRetailerOrFail(id);

    return await this.retailerRepository.updateRetailer(retailer, data);
  }

  public async deleteOneById(id: number) {
    return await this.retailerRepository.delete(id);
  }

  /** Get calendar charges for a retailer (by uuid). */
  public async getCalendarCharges(id: string) {
    const retailer = await this.getRequestedRetailerOrFail(id as any);
    return {
      saturdayCharge: retailer.saturdayCharge != null ? Number(retailer.saturdayCharge) : 0,
      sundayCharge: retailer.sundayCharge != null ? Number(retailer.sundayCharge) : 0,
      holidayCharge: retailer.holidayCharge != null ? Number(retailer.holidayCharge) : 0
    };
  }

  /** Update calendar charges for a retailer (by uuid). */
  public async updateCalendarCharges(id: string, data: { saturdayCharge?: number; sundayCharge?: number; holidayCharge?: number }) {
    const retailer = await this.getRequestedRetailerOrFail(id as any);
    if (data.saturdayCharge != null) retailer.saturdayCharge = data.saturdayCharge;
    if (data.sundayCharge != null) retailer.sundayCharge = data.sundayCharge;
    if (data.holidayCharge != null) retailer.holidayCharge = data.holidayCharge;
    return await this.retailerRepository.updateRetailer(retailer, data);
  }

  private async getRequestedRetailerOrFail(id: number | string, resourceOptions?: object) {
    let retailer = await this.retailerRepository.getOneById(id as any, resourceOptions);

    if (!retailer) {
      throw new RetailerNotFoundException();
    }

    return retailer;
  }
}

