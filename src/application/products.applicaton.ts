import { Product } from './domain/entities/product.entity';
import { CreateProductInput, PaginatedResult, ProductData } from './ports/product-repository.port';
import { CreateProductUseCase } from './use-cases/create-product.use-case';
import { GetProductsUseCase } from './use-cases/get-products.use-case';
import { UpdateProductStockUseCase } from './use-cases/update-product-stock.use-case';
import { DeleteProductUseCase } from './use-cases/delete-product.use-case';

export class ProductsApplication {
  constructor(
    private readonly createProductUseCase: CreateProductUseCase,
    private readonly getProductsUseCase: GetProductsUseCase,
    private readonly updateProductStockUseCase: UpdateProductStockUseCase,
    private readonly deleteProductUseCase: DeleteProductUseCase,
  ) {}

  async create(product: CreateProductInput): Promise<Product> {
    return this.createProductUseCase.execute(product);
  }

  async findAll(page?: number, limit?: number): Promise<PaginatedResult<Product>> {
    return this.getProductsUseCase.execute(page, limit);
  }

  async update(id: string, product: Partial<ProductData>): Promise<Product> {
    return this.updateProductStockUseCase.execute(id, product);
  }

  async remove(id: string): Promise<void> {
    return this.deleteProductUseCase.execute(id);
  }
}
