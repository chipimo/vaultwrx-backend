import { Service } from 'typedi';
import { ProductRepository } from '@api/repositories/Products/ProductRepository';
import { ProductNotFoundException } from '@api/exceptions/Products/ProductNotFoundException';
import { EventDispatcher, EventDispatcherInterface } from '@base/decorators/EventDispatcher';
import { InjectRepository } from 'typeorm-typedi-extensions';

@Service()
export class ProductService {
  constructor(
    @InjectRepository() private productRepository: ProductRepository,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface
  ) {}

  public async getAll(resourceOptions?: object, companyId?: string) {
    return await this.productRepository.getManyAndCount(resourceOptions, companyId);
  }

  public async findOneById(id: string, resourceOptions?: object, companyId?: string) {
    return await this.getRequestedProductOrFail(id, resourceOptions, companyId);
  }

  public async create(data: object, companyId?: string) {
    let product = await this.productRepository.createProduct(data, companyId);

    this.eventDispatcher.dispatch('onProductCreate', product);

    return product;
  }

  public async updateOneById(id: string, data: object, companyId?: string) {
    const product = await this.getRequestedProductOrFail(id, undefined, companyId);

    return await this.productRepository.updateProduct(product, data);
  }

  public async deleteOneById(id: string, companyId?: string) {
    if (companyId) {
      const product = await this.getRequestedProductOrFail(id, undefined, companyId);
      return await this.productRepository.delete(product.id);
    }
    return await this.productRepository.delete(id);
  }

  public async getProductsGroupedByType(resourceOptions?: object, companyId?: string) {
    return await this.productRepository.getProductsGroupedByType(companyId, resourceOptions);
  }

  private async getRequestedProductOrFail(id: string, resourceOptions?: object, companyId?: string) {
    let product = await this.productRepository.getOneById(id, resourceOptions, companyId);

    if (!product) {
      throw new ProductNotFoundException();
    }

    return product;
  }
}

