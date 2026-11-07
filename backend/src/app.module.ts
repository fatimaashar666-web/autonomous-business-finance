import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { configuration } from './config/index.js';
import { PrismaModule } from './prisma/index.js';
import { HealthModule } from './health/index.js';
import { FinanceModule } from './finance/finance.module.js';
import { OrchestrationModule } from './orchestration/orchestration.module.js';

@Module({
  imports: [
    // ── Load .env and make ConfigService available everywhere ──
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),

    // ── Database (Prisma) ─────────────────────────────────────
    PrismaModule,

    // ── Health Check ──────────────────────────────────────────
    HealthModule,

    // ── Central Financial Core & Ingestion Engine ─────────────
    FinanceModule,

    // ── Autonomous Multi-Agent AI System & Orchestrator ───────
    OrchestrationModule,
  ],
})
export class AppModule {}
