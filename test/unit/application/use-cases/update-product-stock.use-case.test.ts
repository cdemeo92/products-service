import { UpdateProductStockUseCase } from '../../../../src/application/use-cases/update-product-stock.use-case';
import type {
  IProductRepository,
  ProductData,
} from '../../../../src/application/ports/product-repository.port';
import { Product } from '../../../../src/application/domain/entities/product.entity';
import { ProductNotFoundException } from '../../../../src/application/domain/exceptions';
import { mock, MockProxy } from 'jest-mock-extended';

describe('UpdateProductStockUseCase', () => {
  let useCase: UpdateProductStockUseCase;
  let productRepository: MockProxy<IProductRepository>;

  const productId = 'uuid-1';
  const partialUpdate: Partial<ProductData> = { stock: 20 };

  const updatedProduct = new Product({
    id: productId,
    productToken: 'T1',
    name: 'Product',
    price: 19.99,
    stock: 20,
  });

  beforeEach(() => {
    productRepository = mock<IProductRepository>();
    useCase = new UpdateProductStockUseCase(productRepository);
  });

  describe('execute', () => {
    it('should delegate to repository update and return the updated product', async () => {
      productRepository.update.mockResolvedValue(updatedProduct);

      const result = await useCase.execute(productId, partialUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(productId, partialUpdate);
      expect(productRepository.update).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Product);
      expect(result).toBe(updatedProduct);
      expect(result.id).toBe(productId);
      expect(result.stock).toBe(20);
    });

    it('should throw ProductNotFoundException when product does not exist', async () => {
      productRepository.update.mockResolvedValue(null);

      const promise = useCase.execute(productId, partialUpdate);
      await expect(promise).rejects.toThrow(ProductNotFoundException);
      await expect(promise).rejects.toThrow(`Product not found: ${productId}`);

      expect(productRepository.update).toHaveBeenCalledWith(productId, partialUpdate);
    });

    it('should propagate error when update fails', async () => {
      productRepository.update.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(productId, partialUpdate)).rejects.toThrow('Database error');

      expect(productRepository.update).toHaveBeenCalledWith(productId, partialUpdate);
    });

    it('should support partial update of name and price', async () => {
      const namePriceUpdate = { name: 'New Name', price: 9.99 };
      const productAfterUpdate = new Product({
        id: productId,
        productToken: 'T1',
        name: 'New Name',
        price: 9.99,
        stock: 5,
      });
      productRepository.update.mockResolvedValue(productAfterUpdate);

      const result = await useCase.execute(productId, namePriceUpdate);

      expect(productRepository.update).toHaveBeenCalledWith(productId, namePriceUpdate);
      expect(result.name).toBe('New Name');
      expect(result.price).toBe(9.99);
    });
  });
});
