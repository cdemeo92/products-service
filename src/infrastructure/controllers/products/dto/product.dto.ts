import { ApiProperty } from '@nestjs/swagger';
import { Product } from 'src/application/domain/entities/product.entity';

export class ProductDto {
  @ApiProperty({ example: 1, description: 'Product id' })
  public readonly id!: string;

  @ApiProperty({ example: 'TOKEN-001', description: 'Unique product token (business identifier)' })
  public readonly productToken!: string;

  @ApiProperty({ example: 'Product Name', description: 'Product name' })
  public readonly name!: string;

  @ApiProperty({ example: 19.99, description: 'Product price (decimal; no currency)' })
  public readonly price!: number;

  @ApiProperty({ example: 100, description: 'Stock quantity (integer)' })
  public readonly stock!: number;

  constructor(product: Product) {
    this.id = product.id!;
    this.productToken = product.productToken;
    this.name = product.name;
    this.price = product.price;
    this.stock = product.stock;
  }
}
