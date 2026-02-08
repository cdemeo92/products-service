import { ProductsApplication } from '../../../src/application/products.applicaton';
import { CreateProductUseCase } from '../../../src/application/use-cases/create-product.use-case';
import { GetProductsUseCase } from '../../../src/application/use-cases/get-products.use-case';
import { UpdateProductStockUseCase } from '../../../src/application/use-cases/update-product-stock.use-case';
import { DeleteProductUseCase } from '../../../src/application/use-cases/delete-product.use-case';
import { Product } from '../../../src/application/domain/entities/product.entity';
import { DuplicateProductTokenException } from '../../../src/application/domain/exceptions';
import { ProductNotFoundException } from '../../../src/application/domain/exceptions';
import { mock, MockProxy } from 'jest-mock-extended';

describe('ProductsApplication', () => {
  let productsApplication: ProductsApplication;
  let createProductUseCase: MockProxy<CreateProductUseCase>;
  let getProductsUseCase: MockProxy<GetProductsUseCase>;
  let updateProductStockUseCase: MockProxy<UpdateProductStockUseCase>;
  let deleteProductUseCase: MockProxy<DeleteProductUseCase>;

  const validInput = {
    productToken: 'TOKEN-123',
    name: 'Test Product',
    price: 19.99,
    stock: 10,
  };

  const createdProduct = new Product({
    id: 'uuid-1',
    productToken: validInput.productToken,
    name: validInput.name,
    price: validInput.price,
    stock: validInput.stock,
  });

  const paginatedResult = {
    data: [createdProduct],
    total: 1,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  beforeEach(() => {
    createProductUseCase = mock<CreateProductUseCase>();
    getProductsUseCase = mock<GetProductsUseCase>();
    updateProductStockUseCase = mock<UpdateProductStockUseCase>();
    deleteProductUseCase = mock<DeleteProductUseCase>();
    productsApplication = new ProductsApplication(
      createProductUseCase,
      getProductsUseCase,
      updateProductStockUseCase,
      deleteProductUseCase,
    );
  });

  describe('create', () => {
    it('should delegate to createProductUseCase and return the created product', async () => {
      createProductUseCase.execute.mockResolvedValue(createdProduct);

      const result = await productsApplication.create(validInput);

      expect(createProductUseCase.execute).toHaveBeenCalledWith(validInput);
      expect(createProductUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Product);
      expect(result).toBe(createdProduct);
      expect(result.productToken).toBe(validInput.productToken);
      expect(result.name).toBe(validInput.name);
    });

    it('should propagate DuplicateProductTokenException when productToken already exists', async () => {
      createProductUseCase.execute.mockRejectedValue(
        new DuplicateProductTokenException(validInput.productToken),
      );

      const promise = productsApplication.create(validInput);
      await expect(promise).rejects.toThrow(DuplicateProductTokenException);
      await expect(promise).rejects.toThrow(
        `Product token already exists: ${validInput.productToken}`,
      );

      expect(createProductUseCase.execute).toHaveBeenCalledWith(validInput);
    });

    it('should propagate any error from createProductUseCase', async () => {
      createProductUseCase.execute.mockRejectedValue(new Error('Database error'));

      await expect(productsApplication.create(validInput)).rejects.toThrow('Database error');

      expect(createProductUseCase.execute).toHaveBeenCalledWith(validInput);
    });
  });

  describe('findAll', () => {
    it('should delegate to getProductsUseCase and return paginated result', async () => {
      getProductsUseCase.execute.mockResolvedValue(paginatedResult);

      const result = await productsApplication.findAll(1, 10);

      expect(getProductsUseCase.execute).toHaveBeenCalledWith(1, 10);
      expect(getProductsUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toEqual(paginatedResult);
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('should call getProductsUseCase with undefined when findAll receives no args', async () => {
      getProductsUseCase.execute.mockResolvedValue(paginatedResult);

      await productsApplication.findAll();

      expect(getProductsUseCase.execute).toHaveBeenCalledWith(undefined, undefined);
      expect(getProductsUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate error from getProductsUseCase', async () => {
      getProductsUseCase.execute.mockRejectedValue(new Error('Database error'));

      await expect(productsApplication.findAll(1, 10)).rejects.toThrow('Database error');

      expect(getProductsUseCase.execute).toHaveBeenCalledWith(1, 10);
    });
  });

  describe('update', () => {
    it('should delegate to updateProductStockUseCase and return the updated product', async () => {
      const updatedProduct = new Product({
        id: 'uuid-1',
        productToken: 'T1',
        name: 'Updated',
        price: 9.99,
        stock: 20,
      });
      updateProductStockUseCase.execute.mockResolvedValue(updatedProduct);

      const result = await productsApplication.update('uuid-1', { stock: 20 });

      expect(updateProductStockUseCase.execute).toHaveBeenCalledWith('uuid-1', { stock: 20 });
      expect(updateProductStockUseCase.execute).toHaveBeenCalledTimes(1);
      expect(result).toBe(updatedProduct);
      expect(result.stock).toBe(20);
    });

    it('should propagate ProductNotFoundException when product does not exist', async () => {
      updateProductStockUseCase.execute.mockRejectedValue(new ProductNotFoundException('uuid-1'));

      const promise = productsApplication.update('uuid-1', { stock: 20 });
      await expect(promise).rejects.toThrow(ProductNotFoundException);
      await expect(promise).rejects.toThrow('Product not found: uuid-1');

      expect(updateProductStockUseCase.execute).toHaveBeenCalledWith('uuid-1', { stock: 20 });
    });
  });

  describe('remove', () => {
    it('should delegate to deleteProductUseCase', async () => {
      deleteProductUseCase.execute.mockResolvedValue(undefined);

      await productsApplication.remove('uuid-1');

      expect(deleteProductUseCase.execute).toHaveBeenCalledWith('uuid-1');
      expect(deleteProductUseCase.execute).toHaveBeenCalledTimes(1);
    });

    it('should propagate ProductNotFoundException when product does not exist', async () => {
      deleteProductUseCase.execute.mockRejectedValue(new ProductNotFoundException('uuid-1'));

      const promise = productsApplication.remove('uuid-1');
      await expect(promise).rejects.toThrow(ProductNotFoundException);
      await expect(promise).rejects.toThrow('Product not found: uuid-1');

      expect(deleteProductUseCase.execute).toHaveBeenCalledWith('uuid-1');
    });
  });
});
