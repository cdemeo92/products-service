import path from 'path';
import request from 'supertest';
import { DockerComposeEnvironment, Wait } from 'testcontainers';

describe('App (e2e)', () => {
  let baseUrl: string;
  let composeEnv: Awaited<ReturnType<DockerComposeEnvironment['up']>>;

  const composePath = path.resolve(__dirname, '../..');
  const composeFile = 'docker-compose.yml';

  const nonExistentId = '00000000-0000-0000-0000-000000000001';

  beforeAll(async () => {
    composeEnv = await new DockerComposeEnvironment(composePath, composeFile)
      .withEnvironment({
        MYSQL_ROOT_PASSWORD: 'root',
        MYSQL_DATABASE: 'ecommerce_test',
        MYSQL_USER: 'test-user',
        MYSQL_PASSWORD: 'test-password',
        MYSQL_PORT: '6603',
        PORT: '6000',
        NODE_ENV: 'development',
      })
      .withBuild()
      .withWaitStrategy('db-1', Wait.forLogMessage('ready for connections'))
      .withWaitStrategy('app-1', Wait.forLogMessage('Server listening'))
      .up(['db', 'app']);

    const appContainer = composeEnv.getContainer('app-1');
    const host = appContainer.getHost();
    const port = appContainer.getMappedPort(6000);
    baseUrl = `http://${host}:${port}`;
  }, 300_000);

  afterAll(async () => {
    await composeEnv?.down();
  }, 30_000);

  describe('GET /', () => {
    it('should redirect to /docs with 302', () => {
      return request(baseUrl).get('/').expect(302).expect('Location', '/docs');
    });
  });

  describe('GET /docs', () => {
    it('should return Swagger UI page', () => {
      return request(baseUrl)
        .get('/docs')
        .expect(200)
        .expect('Content-Type', /html/)
        .expect((res) => {
          expect(res.text).toMatch(/swagger|openapi/i);
        });
    });
  });

  describe('GET /health', () => {
    it('should return health status with database up', () => {
      return request(baseUrl)
        .get('/health')
        .expect(200)
        .expect((res) => {
          expect(res.body).toHaveProperty('status', 'ok');
          expect(res.body.info.database).toHaveProperty('status', 'up');
        });
    });
  });

  describe('Happy path — API round-trip', () => {
    it('POST /products → 201', async () => {
      const token = `E2E-${Date.now()}`;
      const createRes = await request(baseUrl)
        .post('/products')
        .send({ productToken: token, name: 'E2E Product', price: 9.99, stock: 5 })
        .expect(201);

      expect(createRes.body).toMatchObject({
        productToken: token,
        name: 'E2E Product',
        price: 9.99,
        stock: 5,
      });
      expect(createRes.body.id).toBeDefined();
    });

    it('GET /products → 200 with pagination', async () => {
      const token = `E2E-LIST-${Date.now()}`;
      const createRes = await request(baseUrl)
        .post('/products')
        .send({ productToken: token, name: 'E2E List', price: 1, stock: 1 })
        .expect(201);

      const listRes = await request(baseUrl).get('/products').query({ page: 1, limit: 10 }).expect(200);

      expect(listRes.body).toHaveProperty('products');
      expect(listRes.body).toHaveProperty('page', 1);
      expect(listRes.body).toHaveProperty('limit', 10);
      expect(listRes.body).toHaveProperty('total');
      expect(listRes.body).toHaveProperty('totalPages');
      expect(Array.isArray(listRes.body.products)).toBe(true);
      expect(listRes.body.products.some((p: { id: string }) => p.id === createRes.body.id)).toBe(true);
    });

    it('PATCH /products/:id → 200', async () => {
      const token = `E2E-PATCH-${Date.now()}`;
      const createRes = await request(baseUrl)
        .post('/products')
        .send({ productToken: token, name: 'E2E Patch', price: 1, stock: 1 })
        .expect(201);

      const updateRes = await request(baseUrl)
        .patch(`/products/${createRes.body.id}`)
        .send({ stock: 99 })
        .expect(200);

      expect(updateRes.body.stock).toBe(99);
    });

    it('DELETE /products/:id → 204', async () => {
      const token = `E2E-DEL-${Date.now()}`;
      const createRes = await request(baseUrl)
        .post('/products')
        .send({ productToken: token, name: 'E2E Del', price: 1, stock: 1 })
        .expect(201);

      const id = createRes.body.id;

      await request(baseUrl).delete(`/products/${id}`).expect(204);

      const listAfter = await request(baseUrl).get('/products').query({ page: 1, limit: 100 }).expect(200);

      expect(listAfter.body.products.some((p: { id: string }) => p.id === id)).toBe(false);
    });
  });

    describe('Validation — DTO and query', () => {
      it('POST /products — 400 when productToken missing', () => {
        return request(baseUrl)
          .post('/products')
          .send({ name: 'X', price: 1, stock: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when name missing', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK', price: 1, stock: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when price missing', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK', name: 'X', stock: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when stock missing', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK', name: 'X', price: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when body empty', () => {
        return request(baseUrl)
          .post('/products')
          .send({})
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when productToken empty string', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: '', name: 'X', price: 1, stock: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when name empty string', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK', name: '', price: 1, stock: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when price negative', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK-NEG', name: 'X', price: -1, stock: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when stock negative', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK-NEG2', name: 'X', price: 1, stock: -1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when price not a number', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK-T', name: 'X', price: 'not-a-number', stock: 1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when stock not an integer', () => {
        return request(baseUrl)
          .post('/products')
          .send({ productToken: 'TK-T2', name: 'X', price: 1, stock: 'five' })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('GET /products — 400 when page < 1', () => {
        return request(baseUrl)
          .get('/products')
          .query({ page: 0, limit: 10 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('GET /products — 400 when limit < 1', () => {
        return request(baseUrl)
          .get('/products')
          .query({ page: 1, limit: 0 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('GET /products — 400 when limit > 100', () => {
        return request(baseUrl)
          .get('/products')
          .query({ page: 1, limit: 101 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('GET /products — 400 when page/size not numeric', () => {
        return request(baseUrl)
          .get('/products')
          .query({ page: 'abc', limit: 'xyz' })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('PATCH /products/:id — 400 when stock negative', async () => {
        const token = `E2E-PATCH-VAL-${Date.now()}`;
        const createRes = await request(baseUrl)
          .post('/products')
          .send({ productToken: token, name: 'X', price: 1, stock: 1 })
          .expect(201);

        await request(baseUrl)
          .patch(`/products/${createRes.body.id}`)
          .send({ stock: -1 })
          .expect(400)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('POST /products — 400 when body is malformed JSON', () => {
        return request(baseUrl)
          .post('/products')
          .set('Content-Type', 'application/json')
          .send('{ invalid }')
          .expect(400);
      });
    });

    describe('Error responses — 409 and 404', () => {
      it('POST /products — 409 when productToken already exists', async () => {
        const token = `E2E-DUP-${Date.now()}`;
        await request(baseUrl)
          .post('/products')
          .send({ productToken: token, name: 'First', price: 1, stock: 1 })
          .expect(201);

        const res = await request(baseUrl)
          .post('/products')
          .send({ productToken: token, name: 'Second', price: 2, stock: 2 })
          .expect(409);

        expect(res.body).toHaveProperty('error');
      });

      it('PATCH /products/:id — 404 when id does not exist', () => {
        return request(baseUrl)
          .patch(`/products/${nonExistentId}`)
          .send({ stock: 1 })
          .expect(404)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });

      it('DELETE /products/:id — 404 when id does not exist', () => {
        return request(baseUrl)
          .delete(`/products/${nonExistentId}`)
          .expect(404)
          .expect((res) => expect(res.body).toHaveProperty('error'));
      });
    });
});
