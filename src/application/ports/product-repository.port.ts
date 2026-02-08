import { Product } from '../domain/entities/product.entity';

export interface ProductData {
  name: string;
  price: number;
  stock: number;
}

export interface CreateProductInput extends ProductData {
  productToken: string;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface IProductRepository {
  create(product: CreateProductInput): Promise<Product>;
  findByProductToken(productToken: string): Promise<Product | null>;
  findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Product>>;
  update(id: string, product: Partial<ProductData>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
