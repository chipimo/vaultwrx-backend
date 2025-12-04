import { FuneralDirector } from '@api/models/Users/FuneralDirector';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(FuneralDirector)
export class FuneralDirectorRepository extends RepositoryBase<FuneralDirector> {
  public async createFuneralDirector(data: object) {
    let entity = new FuneralDirector();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateFuneralDirector(funeralDirector: FuneralDirector, data: object) {
    Object.assign(funeralDirector, data);

    return await funeralDirector.save(data);
  }
}

