import { Controller, Get } from '@nestjs/common';
import { HealthService } from './health.service.js';

@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  /**
   * GET /api/health
   * Returns the current server status, uptime, timestamp, and environment.
   */
  @Get()
  check() {
    return this.healthService.check();
  }
}
