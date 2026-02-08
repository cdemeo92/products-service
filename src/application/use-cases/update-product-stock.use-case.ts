import type { IProductRepository, ProductData } from '../ports/product-repository.port';
import { Product } from '../domain/entities/product.entity';
import { ProductNotFoundException } from '../domain/exceptions';

export class UpdateProductStockUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string, product: Partial<ProductData>): Promise<Product> {
    const payload = {
      ...(product.stock !== undefined ? { stock: product.stock } : {}),
      ...(product.name !== undefined ? { name: product.name } : {}),
      ...(product.price !== undefined ? { price: product.price } : {}),
    };

    if (Object.keys(payload).length > 0) {
      const updated = await this.productRepository.update(id, payload);
      if (!updated) throw new ProductNotFoundException(id);
    }

    const updatedProduct = await this.productRepository.findById(id);
    if (!updatedProduct) throw new ProductNotFoundException(id);
    return updatedProduct;
  }
}
