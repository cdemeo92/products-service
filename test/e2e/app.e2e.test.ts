import path from 'path';
import request from 'supertest';
import { DockerComposeEnvironment, Wait } from 'testcontainers';

describe('App (e2e)', () => {
  let baseUrl: string;
  let composeEnv: Awaited<ReturnType<DockerComposeEnvironment['up']>>;

  const composePath = path.resolve(__dirname, '../..');
  const composeFile = 'docker-compose.yml';

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
      .withWaitStrategy('app-1', Wait.forHttp('/health', 6000))
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
});
