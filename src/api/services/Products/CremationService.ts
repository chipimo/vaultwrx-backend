import { Service } from 'typedi';
import { CremationRepository } from '@api/repositories/Products/CremationRepository';
import { CremationNotFoundException } from '@api/exceptions/Products/CremationNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class CremationService {
  constructor(
    @InjectRepository() private cremationRepository: CremationRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.cremationRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: string, resourceOptions?: object) {
    return await this.getRequestedCremationOrFail(id, resourceOptions);
  }

  public async findOneByProductId(productId: string, resourceOptions?: object) {
    const cremation = await this.cremationRepository.getOneByProductId(productId, resourceOptions);
    
    if (!cremation) {
      throw new CremationNotFoundException();
    }

    return cremation;
  }

  public async create(data: object) {
    let cremation = await this.cremationRepository.createCremation(data);

    this.eventDispatcher.dispatch('onCremationCreate', cremation);

    return cremation;
  }

  public async updateOneById(id: string, data: object) {
    const cremation = await this.getRequestedCremationOrFail(id);

    return await this.cremationRepository.updateCremation(cremation, data);
  }

  public async updateByProductId(productId: string, data: object) {
    const cremation = await this.cremationRepository.getOneByProductId(productId);

    if (!cremation) {
      throw new CremationNotFoundException();
    }

    return await this.cremationRepository.updateCremation(cremation, data);
  }

  public async deleteOneById(id: string) {
    const cremation = await this.getRequestedCremationOrFail(id);
    return await this.cremationRepository.delete(cremation.id);
  }

  private async getRequestedCremationOrFail(id: string, resourceOptions?: object) {
    let cremation = await this.cremationRepository.getOneById(id, resourceOptions);

    if (!cremation) {
      throw new CremationNotFoundException();
    }

    return cremation;
  }
}

