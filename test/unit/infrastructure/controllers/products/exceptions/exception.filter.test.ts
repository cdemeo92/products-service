import { HttpStatus, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { ArgumentsHost } from '@nestjs/common/interfaces/features/arguments-host.interface';
import { ProductsExceptionFilter } from '../../../../../../src/infrastructure/controllers/products/exceptions/exception.filter';
import {
  ProductNotFoundException,
  DuplicateProductTokenException,
} from '../../../../../../src/application/domain/exceptions';

describe('ProductsExceptionFilter', () => {
  let filter: ProductsExceptionFilter;
  let mockResponse: { status: jest.Mock; json: jest.Mock };
  let mockHost: ArgumentsHost;

  beforeEach(() => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation();
    filter = new ProductsExceptionFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockHost = {
      switchToHttp: jest.fn().mockReturnValue({
        getResponse: () => mockResponse,
      }),
    } as unknown as ArgumentsHost;
  });

  describe('catch', () => {
    it('should set status 404 and body with error when exception is ProductNotFoundException', () => {
      const exception = new ProductNotFoundException('42');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Product not found: 42' });
    });

    it('should set status 409 and body with error when exception is DuplicateProductTokenException', () => {
      const exception = new DuplicateProductTokenException('T1');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Product token already exists: T1' });
    });

    it('should set status and body from HttpException', () => {
      const exception = new NotFoundException('Product not found');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Product not found' });
    });

    it('should use first message when HttpException response message is array', () => {
      const exception = new BadRequestException({ message: ['first', 'second'] });

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'first' });
    });

    it('should set status 500 and fixed message when exception is Error', () => {
      const exception = new Error('Something broke');

      filter.catch(exception, mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });

    it('should set status 500 and fixed message when exception is not Error', () => {
      filter.catch('string error', mockHost);

      expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
