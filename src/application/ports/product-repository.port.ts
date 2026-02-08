import { Product } from '../domain/entities/product.entity';

export interface ProductData {
  name: string;
  price: number;
  stock: number;
}

export interface CreateProductInput extends ProductData {
  productToken: string;
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
  findWithLimitOffset(limit: number, offset: number): Promise<{ data: Product[]; total: number }>;
  update(id: string, product: Partial<ProductData>): Promise<Product | null>;
  delete(id: string): Promise<boolean>;
}
