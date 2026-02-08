import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsNumber, Min, IsInt, IsOptional } from 'class-validator';

export class UpdateProductDto {
  @ApiPropertyOptional({
    example: 'Product Name',
    description: 'Product name',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MinLength(1, { message: 'name must not be empty' })
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    example: 19.99,
    description: 'Product price (numeric; no currency or multi-currency support).',
    minimum: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiPropertyOptional({
    example: 100,
    description: 'Stock quantity (integer, non-negative).',
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock?: number;
}
