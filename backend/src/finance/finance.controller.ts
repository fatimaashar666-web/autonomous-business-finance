import {
  Controller,
  Get,
  Post,
  Body,
  Query,
} from '@nestjs/common';
import { FinanceService } from './finance.service.js';
import { FinanceRepository } from './finance.repository.js';
import { TransactionStatus } from './finance.types.js';
import { CreateTransactionDto } from './dto/create-transaction.dto.js';

@Controller('finance')
export class FinanceController {
  constructor(
    private readonly financeService: FinanceService,
    private readonly repo: FinanceRepository,
  ) {}

  @Get('metrics')
  getMetrics() {
    return this.financeService.getMetrics();
  }

  @Get('transactions')
  getTransactions(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.financeService.getTransactions(lim);
  }

  @Post('transactions')
  createTransaction(@Body() dto: CreateTransactionDto) {
    // 1. Auto-categorize if not provided
    const category =
      dto.category && dto.category.trim().length > 0
        ? dto.category
        : this.financeService.categorizeTransaction(dto.description, dto.merchant);

    // 2. Anomaly evaluation
    const anomaly = this.financeService.evaluateAnomaly(dto.amount, category);

    const accounts = this.repo.getAccounts();
    const targetAccountId = dto.accountId || accounts[0]?.id || 'acc-op-01';

    const newTx = this.repo.addTransaction({
      accountId: targetAccountId,
      amount: dto.amount,
      type: dto.type,
      category,
      description: dto.description,
      merchant: dto.merchant,
      date: new Date(),
      status: anomaly.isAnomaly ? TransactionStatus.FLAGGED : TransactionStatus.COMPLETED,
      isSimulated: true,
      anomalyScore: anomaly.isAnomaly ? anomaly.score : undefined,
      anomalyReason: anomaly.isAnomaly ? anomaly.reason : undefined,
    });

    this.repo.addAuditLog(
      'INGESTION_ENGINE',
      anomaly.isAnomaly ? 'WARN' : 'INFO',
      `Ingested ${dto.type} transaction: $${dto.amount} (${category}) - ${dto.description}`,
      { transactionId: newTx.id, anomalyScore: anomaly.score },
    );

    return newTx;
  }

  @Get('accounts')
  getAccounts() {
    return this.financeService.getAccounts();
  }

  @Get('budgets')
  getBudgets() {
    return this.financeService.getDepartmentSpendAnalysis();
  }

  @Get('invoices')
  getInvoices() {
    return this.financeService.getInvoices();
  }

  @Get('forecast')
  getForecast(@Query('days') days?: string) {
    const numDays = days ? parseInt(days, 10) : 30;
    return this.financeService.generateCashFlowForecast(numDays);
  }

  @Get('actions')
  getAgentActions() {
    return this.repo.getAgentActions();
  }

  @Get('audit-logs')
  getAuditLogs(@Query('limit') limit?: string) {
    const lim = limit ? parseInt(limit, 10) : 50;
    return this.repo.getAuditLogs(lim);
  }
}
