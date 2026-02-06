import { config as loadEnv } from 'dotenv';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

loadEnv({ override: false });

async function main() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
  });
  app.useLogger(new Logger());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Products Service')
    .setDescription('Product CRUD API with MySQL and Sequelize')
    .setVersion(process.env.npm_package_version || '1.0.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const httpAdapter = app.getHttpAdapter();
  const instance = httpAdapter.getInstance();
  instance.get('/', (_req: unknown, res: { redirect: (code: number, path: string) => void }) =>
    res.redirect(302, '/docs'),
  );

  const port = parseInt(process.env.PORT || '3000', 10);
  await app.listen(port);

  const url = (await app.getUrl()).replace(/\[::1\]|127\.0\.0\.1/, 'localhost');
  console.log(`Server listening on ${url}`);
}

main().catch((err) => {
  console.error('Failed to start:', err);
  process.exit(1);
});
