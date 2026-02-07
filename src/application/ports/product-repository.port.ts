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
  create(input: CreateProductInput): Promise<Product>;
  findById(id: number): Promise<Product | null>;
  findByProductToken(productToken: string): Promise<Product | null>;
  findAllPaginated(options: PaginationOptions): Promise<PaginatedResult<Product>>;
  update(id: number, product: Partial<ProductData>): Promise<Product | null>;
  delete(id: number): Promise<boolean>;
}
