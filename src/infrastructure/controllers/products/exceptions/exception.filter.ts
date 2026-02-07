import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import {
  ProductNotFoundException,
  DuplicateProductTokenException,
} from '../../../../application/domain/exceptions';

@Catch()
export class ProductsExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ProductsExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof ProductNotFoundException) {
      response.status(HttpStatus.NOT_FOUND).json({ error: exception.message });
      return;
    }

    if (exception instanceof DuplicateProductTokenException) {
      response.status(HttpStatus.CONFLICT).json({ error: exception.message });
      return;
    }

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      const message =
        typeof res === 'object' && res !== null && 'message' in res
          ? (res as { message: string | string[] }).message
          : exception.message;
      response
        .status(exception.getStatus())
        .json({ error: Array.isArray(message) ? message[0] : message });
      return;
    }

    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal server error' });
  }
}
