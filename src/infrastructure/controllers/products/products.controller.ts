import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ProductsApplication } from '../../../application/products.applicaton';
import { CreateProductDto } from './dto/create-product.dto';
import { ProductDto } from './dto/product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { PaginatedProductsDto } from './dto/paginated-products.dto';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsApplication: ProductsApplication) {}

  @Post()
  @ApiOperation({
    summary: 'Create a product',
    description:
      'Creates a new product. The productToken must be unique; if it already exists, the API returns 409 Conflict.',
  })
  @ApiResponse({ status: 201, description: 'Product created successfully', type: ProductDto })
  @ApiResponse({ status: 409, description: 'Conflict — productToken already exists' })
  @ApiResponse({ status: 400, description: 'Validation error (invalid or missing fields)' })
  async create(@Body() createProductDto: CreateProductDto): Promise<ProductDto> {
    this.productsApplication.create();

    return new ProductDto();
  }

  @Get()
  @ApiOperation({
    summary: 'Read products paginated',
    description: 'Retrieves a paginated list of all products.',
  })
  @ApiResponse({
    status: 200,
    description: 'Paginated list of products',
    type: PaginatedProductsDto,
  })
  async findAll(@Query() query: PaginationQueryDto): Promise<PaginatedProductsDto> {
    this.productsApplication.findAll();

    return new PaginatedProductsDto();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get a product by id',
    description: 'Returns a single product by its id.',
  })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiResponse({ status: 200, description: 'Product found', type: ProductDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async findOne(@Param('id') id: string): Promise<ProductDto> {
    this.productsApplication.findOne(+id);

    return new ProductDto();
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update a product',
    description: 'Updates a product by id. Only provided fields are updated.',
  })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiResponse({ status: 200, description: 'Product updated', type: ProductDto })
  @ApiResponse({ status: 404, description: 'Product not found' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ): Promise<ProductDto> {
    this.productsApplication.update(+id);

    return new ProductDto();
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a product',
    description: 'Deletes the product. Returns 204 No Content on success.',
  })
  @ApiParam({ name: 'id', description: 'Product id' })
  @ApiResponse({ status: 204, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  remove(@Param('id') id: string) {
    return this.productsApplication.remove(+id);
  }
}
