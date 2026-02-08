import { execSync } from 'child_process';
import { createDB } from 'mysql-memory-server';
import { Sequelize } from 'sequelize-typescript';
import { Test } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { Products } from '../../src/infrastructure/repositories/models';
import { ProductRepository } from '../../src/infrastructure/repositories/product.repository';
import { ProductsModule } from '../../src/infrastructure/controllers/products/products.module';
import { ProductsApplication } from '../../src/application/products.applicaton';

let db: Awaited<ReturnType<typeof createDB>>;

beforeAll(async () => {
  db = await createDB({
    dbName: 'ecommerce_test',
    username: 'root',
    version: '8.4.x',
  });
  process.env.MYSQL_HOST = '127.0.0.1';
  process.env.MYSQL_PORT = String(db.port);
  process.env.MYSQL_USER = db.username;
  process.env.MYSQL_PASSWORD = '';
  process.env.MYSQL_DATABASE = db.dbName;
  execSync('npx sequelize-cli db:migrate', { env: process.env, stdio: 'pipe' });
}, 30000);

afterAll(async () => {
  await db?.stop();
});

describe('Integration', () => {
  describe('ProductRepository', () => {
    let sequelize: Sequelize;
    let repository: ProductRepository;

    beforeAll(async () => {
      sequelize = new Sequelize({
        dialect: 'mysql',
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DATABASE,
        models: [Products],
        logging: false,
      });
      await sequelize.authenticate();
      repository = new ProductRepository(Products);
    });

    afterAll(async () => {
      await sequelize?.close();
    });

    it('should persist product and read it back from the DB', async () => {
      const created = await repository.create({
        productToken: 'INTEG-READ',
        name: 'Product',
        price: 10.5,
        stock: 5,
      });

      const byToken = await repository.findByProductToken('INTEG-READ');

      expect(byToken).not.toBeNull();
      expect(byToken!.id).toBe(created.id);

      const notFound = await repository.findByProductToken('NON-EXISTENT-TOKEN');

      expect(notFound).toBeNull();

      const { data } = await repository.findWithLimitOffset(10, 0);

      expect(data.some((p) => p.id === created.id)).toBe(true);
    });

    it('should persist update to DB', async () => {
      const created = await repository.create({
        productToken: 'INTEG-UPD',
        name: 'Upd',
        price: 1,
        stock: 10,
      });
      const updated = await repository.update(created.id!, { stock: 99 });

      expect(updated).not.toBeNull();
      expect(updated!.stock).toBe(99);
    });

    it('should persist delete to DB', async () => {
      const created = await repository.create({
        productToken: 'INTEG-DEL',
        name: 'Del',
        price: 1,
        stock: 1,
      });
      await repository.delete(created.id!);

      const { data } = await repository.findWithLimitOffset(100, 0);
      expect(data.some((p) => p.id === created.id)).toBe(false);
    });
  });

  describe('ProductsModule wiring', () => {
    it('should resolve ProductsApplication with model injected and persist to DB', async () => {
      const moduleRef = await Test.createTestingModule({
        imports: [
          ConfigModule.forRoot({ isGlobal: true }),
          SequelizeModule.forRootAsync({
            useFactory: () => ({
              dialect: 'mysql',
              host: process.env.MYSQL_HOST,
              port: parseInt(process.env.MYSQL_PORT || '3306', 10),
              username: process.env.MYSQL_USER,
              password: process.env.MYSQL_PASSWORD || '',
              database: process.env.MYSQL_DATABASE,
              models: [Products],
              logging: false,
            }),
          }),
          ProductsModule,
        ],
      }).compile();

      const app = moduleRef.createNestApplication();
      await app.init();

      const productsApplication = app.get(ProductsApplication);
      const created = await productsApplication.create({
        productToken: 'INTEG-MODULE-1',
        name: 'FromModule',
        price: 12,
        stock: 7,
      });

      expect(created.id).toBeDefined();
      expect(created.productToken).toBe('INTEG-MODULE-1');
      expect(created.name).toBe('FromModule');

      await app.close();
    });
  });
});
