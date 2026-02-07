import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthCheckService, HealthCheck, SequelizeHealthIndicator } from '@nestjs/terminus';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  public constructor(
    private readonly health: HealthCheckService,
    private readonly db: SequelizeHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the service and database connection.',
  })
  @ApiResponse({ status: 200, description: 'Service and database are healthy' })
  @ApiResponse({ status: 503, description: 'Service unhealthy' })
  public check() {
    return this.health.check([() => this.db.pingCheck('database')]);
  }
}
