import type { IProductRepository } from '../ports/product-repository.port';
import { DuplicateProductTokenException } from '../domain/exceptions';

export interface CreateProductInput {
  productToken: string;
  name: string;
  price: number;
  stock: number;
}

export class CreateProductUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(input: CreateProductInput) {
    const existing = await this.productRepository.findByProductToken(input.productToken);
    if (existing) {
      throw new DuplicateProductTokenException(input.productToken);
    }
    return this.productRepository.create(input);
  }
}
