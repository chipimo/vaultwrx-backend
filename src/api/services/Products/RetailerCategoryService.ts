import { Service } from 'typedi';
import { InjectRepository } from 'typeorm-typedi-extensions';
import { RetailerCategoryRepository } from '@api/repositories/Products/RetailerCategoryRepository';

@Service()
export class RetailerCategoryService {
  constructor(
    @InjectRepository() private retailerCategoryRepository: RetailerCategoryRepository
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.retailerCategoryRepository.getManyAndCount(resourceOptions, companyId);
  }
}
