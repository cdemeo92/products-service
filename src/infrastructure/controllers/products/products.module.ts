import { Module } from '@nestjs/common';
import { ProductsApplication } from '../../../application/products.applicaton';
import { ProductsController } from './products.controller';

@Module({
  controllers: [ProductsController],
  providers: [
    {
      provide: ProductsApplication,
      useFactory: () => {
        return new ProductsApplication();
      },
    },
  ],
})
export class ProductsModule {}
