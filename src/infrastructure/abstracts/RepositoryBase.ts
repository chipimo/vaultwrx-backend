import { MainRepository } from 'typeorm-simple-query-parser';

export abstract class RepositoryBase<T> extends MainRepository<T> {
  // Override to support UUID (string) IDs
  public async getOneById(id: string | number, resourceOptions?: object): Promise<T | undefined> {
    return await super.getOneById(id as any, resourceOptions);
  }
}
