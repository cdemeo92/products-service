import { Module } from '@nestjs/common';
import { ProductsApplication } from '../../../application/products.applicaton';
import { ProductsController } from './products.controller';
import { Products } from 'src/infrastructure/repositories/models';
import { ProductRepository } from 'src/infrastructure/repositories/product.repository';
import { CreateProductUseCase } from 'src/application/use-cases/create-product.use-case';
import { GetProductsUseCase } from 'src/application/use-cases/get-products.use-case';
import { UpdateProductStockUseCase } from 'src/application/use-cases/update-product-stock.use-case';
import { DeleteProductUseCase } from 'src/application/use-cases/delete-product.use-case';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: ProductsApplication,
      useFactory: () => {
        const productRepository = new ProductRepository(Products);
        return new ProductsApplication(
          new CreateProductUseCase(productRepository),
          new GetProductsUseCase(productRepository),
          new UpdateProductStockUseCase(productRepository),
          new DeleteProductUseCase(productRepository),
        );
      },
    },
  ],
})
export class ProductsModule {}
