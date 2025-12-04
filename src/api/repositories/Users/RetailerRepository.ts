import { Retailer } from '@api/models/Users/Retailer';
import { EntityRepository } from 'typeorm';
import { RepositoryBase } from '@base/infrastructure/abstracts/RepositoryBase';

@EntityRepository(Retailer)
export class RetailerRepository extends RepositoryBase<Retailer> {
  public async createRetailer(data: object) {
    let entity = new Retailer();

    Object.assign(entity, data);

    return await this.save(entity);
  }

  public async updateRetailer(retailer: Retailer, data: object) {
    Object.assign(retailer, data);

    return await retailer.save(data);
  }
}

