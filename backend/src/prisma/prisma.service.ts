import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

/**
 * Wraps the auto-generated PrismaClient so it can be injected via NestJS DI.
 * Connects on module init (with graceful handling if DB is offline) and disconnects on teardown.
 */
@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Connected to PostgreSQL successfully.');
    } catch (error) {
      this.logger.warn(
        `Unable to connect to PostgreSQL at startup: ${(error as Error).message}. Continuing in offline/setup mode.`,
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
