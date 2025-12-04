import { Deceased } from '@api/models/Orders/Deceased';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Deceased)
export class DeceasedRepository extends RepositoryBase<Deceased> {
  public async createDeceased(data: object) {
    let entity = new Deceased();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateDeceased(deceased: Deceased, data: object) {
    Object.assign(deceased, data);

    return await deceased.save(data);
  }
}

