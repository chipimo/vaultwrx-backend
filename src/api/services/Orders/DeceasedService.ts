import { Service } from 'typedi';
import { DeceasedRepository } from '@api/repositories/Orders/DeceasedRepository';
import { DeceasedNotFoundException } from '@api/exceptions/Orders/DeceasedNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class DeceasedService {
  constructor(
    @InjectRepository() private deceasedRepository: DeceasedRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.deceasedRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedDeceasedOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let deceased = await this.deceasedRepository.createDeceased(data);

    this.eventDispatcher.dispatch('onDeceasedCreate', deceased);

    return deceased;
  }

  public async updateOneById(id: number, data: object) {
    const deceased = await this.getRequestedDeceasedOrFail(id);

    return await this.deceasedRepository.updateDeceased(deceased, data);
  }

  public async deleteOneById(id: number) {
    return await this.deceasedRepository.delete(id);
  }

  private async getRequestedDeceasedOrFail(id: number, resourceOptions?: object) {
    let deceased = await this.deceasedRepository.getOneById(id, resourceOptions);

    if (!deceased) {
      throw new DeceasedNotFoundException();
    }

    return deceased;
  }
}

