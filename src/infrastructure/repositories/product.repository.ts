import type {
  IProductRepository,
  CreateProductInput,
  ProductData,
} from '../../application/ports/product-repository.port';
import { Product } from '../../application/domain/entities/product.entity';
import { Products } from './models';

export class ProductRepository implements IProductRepository {
  constructor(private readonly model: typeof Products) {}

  async create(product: CreateProductInput): Promise<Product> {
    const createdProduct = await this.model.create(product);

    return new Product(createdProduct);
  }

  async findById(id: string): Promise<Product | null> {
    const product = await this.model.findByPk(id);

    return product ? new Product(product) : null;
  }

  async findByProductToken(productToken: string): Promise<Product | null> {
    const product = await this.model.findOne({ where: { productToken } });

    return product ? new Product(product) : null;
  }

  async findWithLimitOffset(
    limit: number,
    offset: number,
  ): Promise<{ data: Product[]; total: number }> {
    const { rows, count } = await this.model.findAndCountAll({
      limit,
      offset,
      order: [['id', 'ASC']],
    });

    return {
      data: rows.map((product) => new Product(product)),
      total: count,
    };
  }

  async update(id: string, payload: Partial<ProductData>): Promise<boolean> {
    const [affected] = await this.model.update(payload, { where: { id } });

    return affected > 0;
  }

  async delete(id: string): Promise<boolean> {
    return !!(await this.model.destroy({ where: { id } }));
  }
}
