import { Product } from './domain/entities/product.entity';
import {
  CreateProductInput,
  PaginationOptions,
  PaginatedResult,
  ProductData,
} from './ports/product-repository.port';

export class ProductsApplication {
  async create(product: CreateProductInput): Promise<Product> {
    throw new Error('Not implemented');
  }

  async findAll(options: PaginationOptions): Promise<PaginatedResult<Product>> {
    throw new Error('Not implemented');
  }

  async update(id: string, product: Partial<ProductData>): Promise<Product> {
    throw new Error('Not implemented');
  }

  async remove(id: string): Promise<void> {
    throw new Error('Not implemented');
  }
}
