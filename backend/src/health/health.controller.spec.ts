import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { HealthController } from './health.controller.js';
import { HealthService } from './health.service.js';
import { describe, it, expect, beforeEach } from 'vitest';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
      controllers: [HealthController],
      providers: [HealthService],
    }).compile();

    controller = module.get<HealthController>(HealthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should return health check data', () => {
    const result = controller.check();
    expect(result).toHaveProperty('status', 'ok');
    expect(result).toHaveProperty('timestamp');
    expect(result).toHaveProperty('uptime');
    expect(result).toHaveProperty('environment');
    expect(typeof result.uptime).toBe('number');
  });
});
