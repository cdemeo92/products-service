import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { TerminusModule } from '@nestjs/terminus';
import { HealthController } from './infrastructure/controllers/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TerminusModule,
    SequelizeModule.forRootAsync({
      useFactory: () => ({
        dialect: 'mysql',
        host: process.env.MYSQL_HOST,
        port: parseInt(process.env.MYSQL_PORT || '3306', 10),
        username: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
        autoLoadModels: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
  ],
  controllers: [HealthController],
})
export class AppModule {}
