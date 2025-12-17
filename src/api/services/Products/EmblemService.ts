import { Service } from 'typedi';
import { EmblemRepository } from '@api/repositories/Products/EmblemRepository';
import { EmblemNotFoundException } from '@api/exceptions/Products/EmblemNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class EmblemService {
  constructor(
    @InjectRepository() private emblemRepository: EmblemRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.emblemRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedEmblemOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let emblem = await this.emblemRepository.createEmblem(data, companyId);

    this.eventDispatcher.dispatch('onEmblemCreate', emblem);

    return emblem;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const emblem = await this.getRequestedEmblemOrFail(id, undefined, companyId);

    return await this.emblemRepository.updateEmblem(emblem, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const emblem = await this.getRequestedEmblemOrFail(id, undefined, companyId);
      return await this.emblemRepository.delete(emblem.id);
    }
    return await this.emblemRepository.delete(id);
  }

  private async getRequestedEmblemOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let emblem = await this.emblemRepository.getOneById(id, resourceOptions, companyId);

    if (!emblem) {
      throw new EmblemNotFoundException();
    }

    return emblem;
  }
}

