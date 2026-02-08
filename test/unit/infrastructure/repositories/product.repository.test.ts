import { Product } from '../../../../src/application/domain/entities/product.entity';
import { ProductRepository } from '../../../../src/infrastructure/repositories/product.repository';
import { mock, MockProxy } from 'jest-mock-extended';
import { Products } from '../../../../src/infrastructure/repositories/models';

describe('ProductRepository', () => {
  let repository: ProductRepository;
  let model: MockProxy<typeof Products>;

  const mockRow = (
    overrides: Partial<{
      id: string;
      productToken: string;
      name: string;
      price: string;
      stock: number;
    }> = {},
  ) =>
    ({
      id: '1',
      productToken: 'T1',
      name: 'P',
      price: '10.50',
      stock: 5,
      update: jest.fn().mockResolvedValue(undefined),
      ...overrides,
    }) as unknown as InstanceType<typeof Products>;

  beforeEach(() => {
    model = mock<typeof Products>();
    repository = new ProductRepository(model);
  });

  describe('create', () => {
    it('should return a Product with given properties when the insert operation succeeds', async () => {
      const row = mockRow({ id: '1', productToken: 'T1', name: 'Prod', price: '19.99', stock: 10 });
      model.create.mockResolvedValue(row);
      const input = { productToken: 'T1', name: 'Prod', price: 19.99, stock: 10 };

      const result = await repository.create(input);

      expect(model.create).toHaveBeenCalledWith(input);
      expect(result).toBeInstanceOf(Product);
      expect(result.id).toBeDefined();
      expect(result.id).toBe('1');
      expect(result.productToken).toBe('T1');
      expect(result.name).toBe('Prod');
      expect(Number(result.price)).toBe(19.99);
      expect(result.stock).toBe(10);
    });

    it('should throw an error when the create operation fails', async () => {
      model.create.mockRejectedValue(new Error('Create failed'));

      await expect(
        repository.create({ productToken: 'T1', name: 'Prod', price: 19.99, stock: 10 }),
      ).rejects.toThrow('Create failed');
    });
  });

  describe('findByProductToken', () => {
    it('should return a Product when a product with the given productToken exists', async () => {
      const row = mockRow({ productToken: 'TOKEN-123' });
      model.findOne.mockResolvedValue(row);

      const result = await repository.findByProductToken('TOKEN-123');

      expect(model.findOne).toHaveBeenCalledWith({ where: { productToken: 'TOKEN-123' } });
      expect(result).toBeInstanceOf(Product);
      expect(result?.productToken).toBe('TOKEN-123');
      expect(result?.id).toBe('1');
    });

    it('should return null when no product exists with the given productToken', async () => {
      model.findOne.mockResolvedValue(null);

      const result = await repository.findByProductToken('NON-EXISTENT');

      expect(model.findOne).toHaveBeenCalledWith({ where: { productToken: 'NON-EXISTENT' } });
      expect(result).toBeNull();
    });

    it('should throw an error when the findOne operation fails', async () => {
      model.findOne.mockRejectedValue(new Error('Find one failed'));

      await expect(repository.findByProductToken('TOKEN-123')).rejects.toThrow('Find one failed');
    });
  });

  describe('findWithLimitOffset', () => {
    it('should return data and total when there are no products', async () => {
      model.findAndCountAll.mockResolvedValue({ rows: [], count: 0 } as never);

      const result = await repository.findWithLimitOffset(10, 0);

      expect(model.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['id', 'ASC']],
      });
      expect(result.data).toHaveLength(0);
      expect(result.total).toBe(0);
    });

    it('should return data and total with limit and offset', async () => {
      const row = mockRow();
      model.findAndCountAll.mockResolvedValue({ rows: [row], count: 1 } as never);

      const result = await repository.findWithLimitOffset(10, 0);

      expect(model.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 0,
        order: [['id', 'ASC']],
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).toBeInstanceOf(Product);
      expect(result.total).toBe(1);
    });

    it('should pass limit and offset to findAndCountAll', async () => {
      model.findAndCountAll.mockResolvedValue({ rows: [], count: 25 } as never);

      await repository.findWithLimitOffset(10, 10);

      expect(model.findAndCountAll).toHaveBeenCalledWith({
        limit: 10,
        offset: 10,
        order: [['id', 'ASC']],
      });
    });

    it('should throw an error when the findAndCountAll operation fails', async () => {
      model.findAndCountAll.mockRejectedValue(new Error('Find and count all failed'));

      await expect(repository.findWithLimitOffset(10, 0)).rejects.toThrow(
        'Find and count all failed',
      );
    });
  });

  describe('update', () => {
    it('should return the updated product when the update operation succeeds', async () => {
      const row = mockRow({ stock: 20 });
      model.update.mockResolvedValue([1]);
      model.findByPk.mockResolvedValue(row);

      const result = await repository.update('1', { stock: 20 });

      expect(model.update).toHaveBeenCalledWith({ stock: 20 }, { where: { id: '1' } });
      expect(model.findByPk).toHaveBeenCalledWith('1');
      expect(result).toBeInstanceOf(Product);
      expect(result?.stock).toBe(20);
    });

    it('should return null when does not exist a product with the given id', async () => {
      model.update.mockResolvedValue([0]);

      const result = await repository.update('1', { stock: 20 });

      expect(model.update).toHaveBeenCalledWith({ stock: 20 }, { where: { id: '1' } });
      expect(model.findByPk).not.toHaveBeenCalled();
      expect(result).toBeNull();
    });

    it('should return null when update succeeds but findByPk returns null', async () => {
      model.update.mockResolvedValue([1]);
      model.findByPk.mockResolvedValue(null);

      const result = await repository.update('1', { stock: 20 });

      expect(model.findByPk).toHaveBeenCalledWith('1');
      expect(result).toBeNull();
    });

    it('should pass only defined fields to the update operation', async () => {
      const row = mockRow({ name: 'New', price: '9.99' });
      model.update.mockResolvedValue([1]);
      model.findByPk.mockResolvedValue(row);

      await repository.update('1', { name: 'New', price: 9.99 });

      expect(model.update).toHaveBeenCalledWith(
        { name: 'New', price: 9.99 },
        { where: { id: '1' } },
      );
      expect(model.findByPk).toHaveBeenCalledWith('1');
    });

    it('should throw an error when the update operation fails', async () => {
      model.update.mockRejectedValue(new Error('Update failed'));

      await expect(repository.update('1', { stock: 20 })).rejects.toThrow('Update failed');
    });
  });

  describe('delete', () => {
    it('should return true the product exists and the delete operation succeeds', async () => {
      model.destroy.mockResolvedValue(1);

      const result = await repository.delete('1');

      expect(model.destroy).toHaveBeenCalledWith({ where: { id: '1' } });
      expect(result).toBe(true);
    });

    it('should return false when the product does not exist', async () => {
      model.destroy.mockResolvedValue(0 as never);

      const result = await repository.delete('1');

      expect(result).toBe(false);
    });

    it('should throw an error when the delete operation fails', async () => {
      model.destroy.mockRejectedValue(new Error('Delete failed'));

      await expect(repository.delete('1')).rejects.toThrow('Delete failed');
    });
  });
});
