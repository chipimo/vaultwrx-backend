import { Service } from 'typedi';
import { FuneralDirectorRepository } from '@api/repositories/Users/FuneralDirectorRepository';
import { FuneralDirectorNotFoundException } from '@api/exceptions/Users/FuneralDirectorNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class FuneralDirectorService {
  constructor(
    @InjectRepository() private funeralDirectorRepository: FuneralDirectorRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object) {
    return await this.funeralDirectorRepository.getManyAndCount(resourceOptions);
  }

  public async findOneById(id: number, resourceOptions?: object) {
    return await this.getRequestedFuneralDirectorOrFail(id, resourceOptions);
  }

  public async create(data: object) {
    let funeralDirector = await this.funeralDirectorRepository.createFuneralDirector(data);

    this.eventDispatcher.dispatch('onFuneralDirectorCreate', funeralDirector);

    return funeralDirector;
  }

  public async updateOneById(id: number, data: object) {
    const funeralDirector = await this.getRequestedFuneralDirectorOrFail(id);

    return await this.funeralDirectorRepository.updateFuneralDirector(funeralDirector, data);
  }

  public async deleteOneById(id: number) {
    return await this.funeralDirectorRepository.delete(id);
  }

  private async getRequestedFuneralDirectorOrFail(id: number, resourceOptions?: object) {
    let funeralDirector = await this.funeralDirectorRepository.getOneById(id, resourceOptions);

    if (!funeralDirector) {
      throw new FuneralDirectorNotFoundException();
    }

    return funeralDirector;
  }
}

