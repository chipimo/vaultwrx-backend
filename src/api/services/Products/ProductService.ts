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

  public async getAll(
    resourceOptions?: object,
    companyId?: string,
    extra?: { retailerCategoryId?: string; type?: string; skip?: number; take?: number }
  ) {
    return await this.productRepository.getManyAndCount(resourceOptions, companyId, extra);
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

  /**
   * Soft-delete the product by flipping `is_active` to false, and also
   * remove any price-list links so it disappears from the master and any
   * other price list it was attached to.
   *
   * Hard delete is unsafe because `order_items.product_id` has a NO ACTION
   * FK; soft-delete preserves order history while the listing filter
   * (`is_active = true`) hides the row going forward.
   */
  public async deleteOneById(id: string, companyId?: string) {
    if (!companyId) {
      // Without companyId we can't safely scope. Still clean up junctions
      // for the bare-id path so any shared row delete doesn't leave dangling
      // price_list_products entries.
      await this.productRepository.manager.query(
        `DELETE FROM price_list_products WHERE product_id::text = $1`,
        [String(id)]
      );
      return await this.productRepository.delete(id);
    }

    const product = await this.getRequestedProductOrFail(id, undefined, companyId);

    // Drop the product from every price list (master + any retailer-specific
    // lists). product_id on price_list_products is varchar in the live
    // schema, so cast to text for a safe comparison.
    await this.productRepository.manager.query(
      `DELETE FROM price_list_products WHERE product_id::text = $1`,
      [String(product.id)]
    );

    return await this.productRepository.updateProduct(product, { isActive: false });
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

