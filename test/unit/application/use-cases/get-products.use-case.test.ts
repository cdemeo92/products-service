import { GetProductsUseCase } from '../../../../src/application/use-cases/get-products.use-case';
import type { IProductRepository } from '../../../../src/application/ports/product-repository.port';
import { Product } from '../../../../src/application/domain/entities/product.entity';
import { mock, MockProxy } from 'jest-mock-extended';

describe('GetProductsUseCase', () => {
  let useCase: GetProductsUseCase;
  let productRepository: MockProxy<IProductRepository>;

  const product = new Product({
    id: 'uuid-1',
    productToken: 'T1',
    name: 'Product',
    price: 19.99,
    stock: 5,
  });

  beforeEach(() => {
    productRepository = mock<IProductRepository>();
    useCase = new GetProductsUseCase(productRepository);
  });

  describe('execute', () => {
    it('should use default page 1 and limit 10, call findWithLimitOffset(10, 0), and compute totalPages', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await useCase.execute();

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(10, 0);
      expect(productRepository.findWithLimitOffset).toHaveBeenCalledTimes(1);
      expect(result).toEqual({
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('should use default page 1 and limit 10 when page and limit are undefined', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [product],
        total: 1,
      });

      const result = await useCase.execute(undefined, undefined);

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(10, 0);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(result.totalPages).toBe(1);
    });

    it('should compute offset and call findWithLimitOffset with page 2 and limit 25', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [product],
        total: 50,
      });

      const result = await useCase.execute(2, 25);

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(25, 25);
      expect(productRepository.findWithLimitOffset).toHaveBeenCalledTimes(1);
      expect(result.data).toHaveLength(1);
      expect(result.page).toBe(2);
      expect(result.limit).toBe(25);
      expect(result.total).toBe(50);
      expect(result.totalPages).toBe(2);
    });

    it('should compute totalPages as Math.ceil(total / limit) when total is not divisible by limit', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [],
        total: 25,
      });

      const result = await useCase.execute(1, 10);

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(10, 0);
      expect(result.totalPages).toBe(3);
      expect(result.total).toBe(25);
    });

    it('should compute totalPages 1 when total is 0', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await useCase.execute(1, 10);

      expect(result.totalPages).toBe(1);
    });

    it('should cap limit at 100 when limit exceeds max', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [],
        total: 500,
      });

      await useCase.execute(1, 200);

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(100, 0);
    });

    it('should normalize page to 1 when page is less than 1', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [],
        total: 0,
      });

      await useCase.execute(0, 10);

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(10, 0);
    });

    it('should normalize limit to 1 when limit is less than 1', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [],
        total: 0,
      });

      await useCase.execute(1, 0);

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(1, 0);
    });

    it('should return empty data when no products exist', async () => {
      productRepository.findWithLimitOffset.mockResolvedValue({
        data: [],
        total: 0,
      });

      const result = await useCase.execute(1, 10);

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(10, 0);
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
      expect(result.totalPages).toBe(1);
    });

    it('should propagate error when findWithLimitOffset fails', async () => {
      productRepository.findWithLimitOffset.mockRejectedValue(new Error('Database error'));

      await expect(useCase.execute(1, 10)).rejects.toThrow('Database error');

      expect(productRepository.findWithLimitOffset).toHaveBeenCalledWith(10, 0);
    });
  });
});
