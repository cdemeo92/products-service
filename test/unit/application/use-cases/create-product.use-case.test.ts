import { CreateProductUseCase } from '../../../../src/application/use-cases/create-product.use-case';
import type { IProductRepository } from '../../../../src/application/ports/product-repository.port';
import { Product } from '../../../../src/application/domain/entities/product.entity';
import { DuplicateProductTokenException } from '../../../../src/application/domain/exceptions';
import { mock, MockProxy } from 'jest-mock-extended';

describe('CreateProductUseCase', () => {
  let useCase: CreateProductUseCase;
  let productRepository: MockProxy<IProductRepository>;

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

  beforeEach(() => {
    productRepository = mock<IProductRepository>();
    useCase = new CreateProductUseCase(productRepository);
  });

  describe('execute', () => {
    it('should create and return a product when productToken does not exist', async () => {
      productRepository.findByProductToken.mockResolvedValue(null);
      productRepository.create.mockResolvedValue(createdProduct);

      const result = await useCase.execute(validInput);

      expect(productRepository.findByProductToken).toHaveBeenCalledWith(validInput.productToken);
      expect(productRepository.findByProductToken).toHaveBeenCalledTimes(1);
      expect(productRepository.create).toHaveBeenCalledWith(validInput);
      expect(productRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toBeInstanceOf(Product);
      expect(result.productToken).toBe(validInput.productToken);
      expect(result.name).toBe(validInput.name);
      expect(result.price).toBe(validInput.price);
      expect(result.stock).toBe(validInput.stock);
    });

    it('should throw DuplicateProductTokenException when productToken already exists', async () => {
      const existingProduct = new Product({
        id: 'uuid-existing',
        productToken: validInput.productToken,
        name: 'Existing',
        price: 9.99,
        stock: 1,
      });
      productRepository.findByProductToken.mockResolvedValue(existingProduct);

      await expect(useCase.execute(validInput)).rejects.toThrow(DuplicateProductTokenException);
      await expect(useCase.execute(validInput)).rejects.toThrow(
        `Product token already exists: ${validInput.productToken}`,
      );

      expect(productRepository.findByProductToken).toHaveBeenCalledWith(validInput.productToken);
      expect(productRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate error when findByProductToken fails', async () => {
      productRepository.findByProductToken.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(validInput)).rejects.toThrow('Database error');

      expect(productRepository.create).not.toHaveBeenCalled();
    });

    it('should propagate error when create fails', async () => {
      productRepository.findByProductToken.mockResolvedValue(null);
      productRepository.create.mockRejectedValue(new Error('Insert failed'));

      await expect(useCase.execute(validInput)).rejects.toThrow('Insert failed');

      expect(productRepository.findByProductToken).toHaveBeenCalledWith(validInput.productToken);
      expect(productRepository.create).toHaveBeenCalledWith(validInput);
    });
  });
});
