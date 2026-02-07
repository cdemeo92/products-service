import type {
  IProductRepository,
  CreateProductInput,
  ProductData,
  PaginationOptions,
  PaginatedResult,
} from '../../application/ports/product-repository.port';
import { Product } from '../../application/domain/entities/product.entity';
import { Products } from './models';

export class ProductRepository implements IProductRepository {
  constructor(private readonly model: typeof Products) {}

  async create(product: CreateProductInput): Promise<Product> {
    const createdProduct = await this.model.create(product);

    return new Product(createdProduct);
  }

  async findById(id: number): Promise<Product | null> {
    const product = await this.model.findByPk(id);

    return product ? new Product(product) : null;
  }

  async findByProductToken(productToken: string): Promise<Product | null> {
    const product = await this.model.findOne({ where: { productToken } });

    return product ? new Product(product) : null;
  }

  async findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Product>> {
    const { page, limit } = options;
    const offset = (page - 1) * limit;

    const { rows, count } = await this.model.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    const totalPages = Math.ceil(count / limit) || 1;

    return {
      data: rows.map((product) => new Product(product)),
      total: count,
      page,
      limit,
      totalPages,
    };
  }

  async update(id: number, product: Partial<ProductData>): Promise<Product | null> {
    const [affected] = await this.model.update(
      {
        ...(product.stock !== undefined ? { stock: product.stock } : {}),
        ...(product.name !== undefined ? { name: product.name } : {}),
        ...(product.price !== undefined ? { price: product.price } : {}),
      },
      { where: { id } },
    );

    if (affected === 0) return null;

    const updatedProduct = await this.model.findByPk(id);

    return updatedProduct ? new Product(updatedProduct) : null;
  }

  async delete(id: number): Promise<boolean> {
    return !!(await this.model.destroy({ where: { id } }));
  }
}
