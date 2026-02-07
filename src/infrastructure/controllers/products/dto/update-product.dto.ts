import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNumber, Min, IsInt } from 'class-validator';

export class UpdateProductDto {
  @ApiProperty({
    example: 'Product Name',
    description: 'Product name',
    maxLength: 255,
  })
  @IsString()
  @MinLength(1, { message: 'name must not be empty' })
  @MaxLength(255)
  name?: string;

  @ApiProperty({
    example: 19.99,
    description: 'Product price (numeric; no currency or multi-currency support).',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({
    example: 100,
    description: 'Stock quantity (integer, non-negative).',
    minimum: 0,
  })
  @IsInt()
  @Min(0)
  stock?: number;
}
