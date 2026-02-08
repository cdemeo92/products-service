import { DeleteProductUseCase } from '../../../../src/application/use-cases/delete-product.use-case';
import type { IProductRepository } from '../../../../src/application/ports/product-repository.port';
import { ProductNotFoundException } from '../../../../src/application/domain/exceptions';
import { mock, MockProxy } from 'jest-mock-extended';

describe('DeleteProductUseCase', () => {
  let useCase: DeleteProductUseCase;
  let productRepository: MockProxy<IProductRepository>;

  const productId = 'uuid-1';

  beforeEach(() => {
    productRepository = mock<IProductRepository>();
    useCase = new DeleteProductUseCase(productRepository);
  });

  describe('execute', () => {
    it('should call repository delete and return void when product exists', async () => {
      productRepository.delete.mockResolvedValue(true);

      await useCase.execute(productId);

      expect(productRepository.delete).toHaveBeenCalledWith(productId);
      expect(productRepository.delete).toHaveBeenCalledTimes(1);
    });

    it('should throw ProductNotFoundException when product does not exist', async () => {
      productRepository.delete.mockResolvedValue(false);

      const promise = useCase.execute(productId);
      await expect(promise).rejects.toThrow(ProductNotFoundException);
      await expect(promise).rejects.toThrow(`Product not found: ${productId}`);

      expect(productRepository.delete).toHaveBeenCalledWith(productId);
    });

    it('should propagate error when delete fails', async () => {
      productRepository.delete.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(productId)).rejects.toThrow('Database error');

      expect(productRepository.delete).toHaveBeenCalledWith(productId);
    });
  });
});
