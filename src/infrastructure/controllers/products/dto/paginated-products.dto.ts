import { ApiProperty } from '@nestjs/swagger';
import { ProductDto } from './product.dto';

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductDto], description: 'List of products for the current page' })
  products!: ProductDto[];

  @ApiProperty({ example: 1, description: 'Current page (1-based)' })
  page!: number;

  @ApiProperty({ example: 10, description: 'Number of items per page' })
  limit!: number;

  @ApiProperty({ example: 42, description: 'Total number of products across all pages' })
  total!: number;

  @ApiProperty({ example: 5, description: 'Total number of pages' })
  totalPages!: number;
}
