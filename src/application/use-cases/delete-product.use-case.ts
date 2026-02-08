import type { IProductRepository } from '../ports/product-repository.port';
import { ProductNotFoundException } from '../domain/exceptions';

export class DeleteProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(id: string): Promise<void> {
    const deleted = await this.productRepository.delete(id);

    if (!deleted) {
      throw new ProductNotFoundException(id);
    }
  }
}
