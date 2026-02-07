import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from '../../../../../src/infrastructure/controllers/products/products.controller';
import { ProductsApplication } from '../../../../../src/application/products.applicaton';
import { CreateProductDto } from '../../../../../src/infrastructure/controllers/products/dto/create-product.dto';
import { UpdateProductDto } from '../../../../../src/infrastructure/controllers/products/dto/update-product.dto';
import { PaginationQueryDto } from '../../../../../src/infrastructure/controllers/products/dto/pagination-query.dto';
import { ProductDto } from '../../../../../src/infrastructure/controllers/products/dto/product.dto';
import { PaginatedProductsDto } from '../../../../../src/infrastructure/controllers/products/dto/paginated-products.dto';
import { mock, MockProxy } from 'jest-mock-extended';

describe('ProductsController', () => {
  let controller: ProductsController;
  let productsApplication: MockProxy<ProductsApplication>;

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

      const result = await controller.create(dto);

      expect(productsApplication.create).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ProductDto);
    });
  });

  describe('findAll', () => {
    it('should invoke application findAll and return a PaginatedProductsDto', async () => {
      const query: PaginationQueryDto = { page: 1, limit: 10 };

      const result = await controller.findAll(query);

      expect(productsApplication.findAll).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(PaginatedProductsDto);
    });
  });

  describe('findOne', () => {
    it('should invoke application findOne with numeric id and return a ProductDto', async () => {
      const id = '42';

      const result = await controller.findOne(id);

      expect(productsApplication.findOne).toHaveBeenCalledWith(42);
      expect(productsApplication.findOne).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ProductDto);
    });
  });

  describe('update', () => {
    it('should invoke application update with numeric id and return a ProductDto', async () => {
      const id = '7';
      const dto: UpdateProductDto = { stock: 20 };

      const result = await controller.update(id, dto);

      expect(productsApplication.update).toHaveBeenCalledWith(7);
      expect(productsApplication.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(ProductDto);
    });
  });

  describe('remove', () => {
    it('should invoke application remove with numeric id and return its result', async () => {
      const id = '3';
      const appReturn = Symbol('remove-result');
      productsApplication.remove.mockReturnValue(appReturn as never);

      const result = controller.remove(id);

      expect(productsApplication.remove).toHaveBeenCalledWith(3);
      expect(productsApplication.remove).toHaveBeenCalledTimes(1);
      expect(result).toBe(appReturn);
    });
  });
});
