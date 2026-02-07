import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductDto], description: 'List of products for the current page' })
  public readonly products!: ProductDto[];

  @ApiProperty({ example: 1, description: 'Current page (1-based)' })
  public readonly page!: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  public readonly limit!: number;

  @ApiProperty({ example: 42, description: 'Total number of products across all pages' })
  public readonly total!: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  public readonly totalPages!: number;

  constructor(
    products: ProductDto[],
    paginationResult: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    },
  ) {
    this.products = products;
    this.page = paginationResult.page;
    this.limit = paginationResult.limit;
    this.total = paginationResult.total;
    this.totalPages = paginationResult.totalPages;
  }
}
