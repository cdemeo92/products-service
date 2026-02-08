import type { IProductRepository, PaginatedResult } from '../ports/product-repository.port';
import { Product } from '../domain/entities/product.entity';

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

export class GetProductsUseCase {
  constructor(private readonly productRepository: IProductRepository) {}

  async execute(page?: number, limit?: number): Promise<PaginatedResult<Product>> {
    const pageNum = Math.max(1, page ?? DEFAULT_PAGE);
    const limitNum = Math.min(Math.max(1, limit ?? DEFAULT_LIMIT), MAX_LIMIT);
    const offset = (pageNum - 1) * limitNum;

    const { data, total } = await this.productRepository.findWithLimitOffset(limitNum, offset);

    const totalPages = Math.ceil(total / limitNum) || 1;

    return {
      data,
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
    };
  }
}
