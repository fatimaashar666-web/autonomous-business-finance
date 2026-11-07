import { Module } from '@nestjs/common';
import { FinanceRepository } from './finance.repository.js';
import { FinanceService } from './finance.service.js';
import { FinanceController } from './finance.controller.js';

@Module({
  controllers: [FinanceController],
  providers: [FinanceRepository, FinanceService],
  exports: [FinanceRepository, FinanceService],
})
export class FinanceModule {}
