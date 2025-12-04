import { Service } from 'typedi';
import { DeliveryScheduleRepository } from '@api/repositories/Orders/DeliveryScheduleRepository';
import { DeliveryScheduleNotFoundException } from '@api/exceptions/Orders/DeliveryScheduleNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class DeliveryScheduleService {
  constructor(
    @InjectRepository() private deliveryScheduleRepository: DeliveryScheduleRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.deliveryScheduleRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedDeliveryScheduleOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let deliverySchedule = await this.deliveryScheduleRepository.createDeliverySchedule(data);

    this.eventDispatcher.dispatch('onDeliveryScheduleCreate', deliverySchedule);

    return deliverySchedule;
  }

  public async updateOneById(id: number, data: object) {
    const deliverySchedule = await this.getRequestedDeliveryScheduleOrFail(id);

    return await this.deliveryScheduleRepository.updateDeliverySchedule(deliverySchedule, data);
  }

  public async deleteOneById(id: number) {
    return await this.deliveryScheduleRepository.delete(id);
  }

  private async getRequestedDeliveryScheduleOrFail(id: number, resourceOptions?: object) {
    let deliverySchedule = await this.deliveryScheduleRepository.getOneById(id, resourceOptions);

    if (!deliverySchedule) {
      throw new DeliveryScheduleNotFoundException();
    }

    return deliverySchedule;
  }
}

