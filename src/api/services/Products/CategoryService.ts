import { Service } from 'typedi';
import { CategoryRepository } from '@api/repositories/Products/CategoryRepository';
import { CategoryNotFoundException } from '@api/exceptions/Products/CategoryNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class CategoryService {
  constructor(
    @InjectRepository() private categoryRepository: CategoryRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.categoryRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedCategoryOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let category = await this.categoryRepository.createCategory(data, companyId);

    this.eventDispatcher.dispatch('onCategoryCreate', category);

    return category;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const category = await this.getRequestedCategoryOrFail(id, undefined, companyId);

    return await this.categoryRepository.updateCategory(category, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const category = await this.getRequestedCategoryOrFail(id, undefined, companyId);
      return await this.categoryRepository.delete(category.id);
    }
    return await this.categoryRepository.delete(id);
  }

  private async getRequestedCategoryOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let category = await this.categoryRepository.getOneById(id, resourceOptions, companyId);

    if (!category) {
      throw new CategoryNotFoundException();
    }

    return category;
  }
}

