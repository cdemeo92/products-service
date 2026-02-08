import type { IProductRepository, ProductData } from '../ports/product-repository.port';
import { Product } from '../domain/entities/product.entity';
import { ProductNotFoundException } from '../domain/exceptions';

export class UpdateProductStockUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, product: Partial<ProductData>): Promise<Product> {
    const updatedProduct = await this.productRepository.update(id, product);

    if (!updatedProduct) {
      throw new ProductNotFoundException(id);
    }

    return updatedProduct;
  }
}
