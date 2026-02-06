import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  SequelizeHealthIndicator,
} from '@nestjs/terminus';

@Controller('health')
export class HealthController {
  
  public constructor(
    private readonly health: HealthCheckService,
    private readonly db: SequelizeHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  public check() {
    return this.health.check([
      () => this.db.pingCheck('database'),
    ]);
  }
}
