import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../../../../src/infrastructure/controllers/products/products.controller';
import { ProductsApplication } from '../../../../../src/application/products.applicaton';
import { CreateProductDto } from '../../../../../src/infrastructure/controllers/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../../../src/infrastructure/controllers/products/dto/update-product.dto';
import { PaginationQueryDto } from '../../../../../src/infrastructure/controllers/products/dto/pagination-query.dto';
import { ProductDto } from '../../../../../src/infrastructure/controllers/products/dto/product.dto';
import { PaginatedProductsDto } from '../../../../../src/infrastructure/controllers/products/dto/paginated-products.dto';
import { Product } from '../../../../../src/application/domain/entities/product.entity';
import { mock, MockProxy } from 'jest-mock-extended';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsApplication: MockProxy<ProductsApplication>;

  const mockProduct = (
    overrides: Partial<{
      id: string;
      productToken: string;
      name: string;
      price: number;
      stock: number;
    }> = {},
  ) =>
    new Product({
      id: '1',
      productToken: 'T1',
      name: 'P',
      price: 10,
      stock: 5,
      ...overrides,
    });

  beforeEach(async () => {
    productsApplication = mock<ProductsApplication>();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductsController],
      providers: [
        {
          provide: ProductsApplication,
          useValue: productsApplication,
        },
      ],
    }).compile();
    controller = module.get(ProductsController);
  });

  describe('create', () => {
    it('should invoke application create and return a ProductDto', async () => {
      const dto: CreateProductDto = {
        productToken: 'T1',
        name: 'Product',
        price: 10,
        stock: 5,
      };
      const product = mockProduct({ productToken: 'T1', name: 'Product', price: 10, stock: 5 });
      productsApplication.create.mockResolvedValue(product);

      const result = await controller.create(dto);

      expect(productsApplication.create).toHaveBeenCalledWith(dto);
      expect(productsApplication.create).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ProductDto);
    });
  });

  describe('findAll', () => {
    it('should invoke application findAll and return a PaginatedProductsDto', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };
      productsApplication.findAll.mockResolvedValue({
        data: [mockProduct()],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });

      const result = await controller.findAll(query);

      expect(productsApplication.findAll).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
      });
      expect(productsApplication.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PaginatedProductsDto);
      expect(result.products).toHaveLength(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.total).toBe(1);
      expect(result.totalPages).toBe(1);
    });

    it('should pass pagination to application and return PaginatedProductsDto', async () => {
      const query = new PaginationQueryDto();
      query.page = 2;
      query.limit = 25;
      const data = [mockProduct(), mockProduct()];
      productsApplication.findAll.mockResolvedValue({
        data,
        total: 50,
        page: 2,
        limit: 25,
        totalPages: 2,
      });

      const result = await controller.findAll(query);

      expect(productsApplication.findAll).toHaveBeenCalledWith({ page: 2, limit: 25 });
      expect(productsApplication.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PaginatedProductsDto);
      expect(result.products).toHaveLength(2);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(2);
    });
  });

  describe('findOne', () => {
    it('should invoke application findOne with the id and return a ProductDto', async () => {
      const product = mockProduct();
      productsApplication.findOne.mockResolvedValue(product);

      const result = await controller.findOne('42');

      expect(productsApplication.findOne).toHaveBeenCalledWith('42');
      expect(productsApplication.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ProductDto);
    });
  });

  describe('update', () => {
    it('should invoke application update with the id and return a ProductDto', async () => {
      const dto: UpdateProductDto = { stock: 20 };
      const product = mockProduct({ stock: 20 });
      productsApplication.update.mockResolvedValue(product);

      const result = await controller.update('7', dto);

      expect(productsApplication.update).toHaveBeenCalledWith('7', dto);
      expect(productsApplication.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ProductDto);
    });
  });

  describe('remove', () => {
    it('should invoke application remove with the id and return its result', async () => {
      productsApplication.remove.mockResolvedValue(undefined);

      const result = controller.remove('3');

      expect(productsApplication.remove).toHaveBeenCalledWith('3');
      expect(productsApplication.remove).toHaveBeenCalledTimes(1);
      await expect(result).resolves.toBeUndefined();
    });
  });
});
