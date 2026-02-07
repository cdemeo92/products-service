import { ApiProperty } from '@nestjs/swagger';

export class ProductDto {
  @ApiProperty({ example: 1, description: 'Product id' })
  id!: number;

  @ApiProperty({ example: 'TOKEN-001', description: 'Unique product token (business identifier)' })
  productToken!: string;

  @ApiProperty({ example: 'Product Name', description: 'Product name' })
  name!: string;

  @ApiProperty({ example: 19.99, description: 'Product price (decimal; no currency)' })
  price!: number;

  @ApiProperty({ example: 100, description: 'Stock quantity (integer)' })
  stock!: number;
}
