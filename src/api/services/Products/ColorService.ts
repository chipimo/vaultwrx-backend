import { Service } from 'typedi';
import { ColorRepository } from '@api/repositories/Products/ColorRepository';
import { ColorNotFoundException } from '@api/exceptions/Products/ColorNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class ColorService {
  constructor(
    @InjectRepository() private colorRepository: ColorRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.colorRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedColorOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let color = await this.colorRepository.createColor(data, companyId);

    this.eventDispatcher.dispatch('onColorCreate', color);

    return color;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const color = await this.getRequestedColorOrFail(id, undefined, companyId);

    return await this.colorRepository.updateColor(color, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const color = await this.getRequestedColorOrFail(id, undefined, companyId);
      return await this.colorRepository.delete(color.id);
    }
    return await this.colorRepository.delete(id);
  }

  private async getRequestedColorOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let color = await this.colorRepository.getOneById(id, resourceOptions, companyId);

    if (!color) {
      throw new ColorNotFoundException();
    }

    return color;
  }
}

