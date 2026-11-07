import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  /**
   * Returns a snapshot of the application's runtime health.
   */
  check() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: this.configService.get<string>('nodeEnv', 'development'),
    };
  }
}
