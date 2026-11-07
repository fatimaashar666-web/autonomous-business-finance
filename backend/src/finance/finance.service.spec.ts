import { describe, it, expect, beforeEach } from 'vitest';
import { FinanceRepository } from './finance.repository.js';
import { FinanceService } from './finance.service.js';

describe('FinanceService', () => {
  let repo: FinanceRepository;
  let service: FinanceService;

  beforeEach(async () => {
    // Instantiate mock repo without real DB network requirement
    repo = new FinanceRepository({} as any);
    await repo.onModuleInit();
    service = new FinanceService(repo);
  });

  it('should compute valid financial metrics from repository transactions', () => {
    const metrics = service.getMetrics();
    expect(metrics).toBeDefined();
    expect(metrics.totalRevenue).toBeGreaterThan(0);
    expect(metrics.totalExpenses).toBeGreaterThan(0);
    expect(metrics.totalTreasuryBalance).toBeGreaterThan(0);
    expect(metrics.estimatedRunwayMonths).toBeGreaterThan(0);
    expect(metrics.isSimulatedData).toBe(true);
  });

  it('should generate a 30-day cash flow forecast with non-empty projections', () => {
    const forecast = service.generateCashFlowForecast(30);
    expect(forecast).toHaveLength(30);
    expect(forecast[0]).toHaveProperty('projectedBalance');
    expect(forecast[0]).toHaveProperty('projectedInflow');
    expect(forecast[0]).toHaveProperty('projectedOutflow');
  });

  it('should autonomously categorize expense descriptions', () => {
    expect(service.categorizeTransaction('AWS EC2 on-demand instances', 'Amazon')).toBe('Cloud Services');
    expect(service.categorizeTransaction('Gusto bi-weekly salary', 'Gusto')).toBe('Payroll');
    expect(service.categorizeTransaction('Google search ads campaign', 'Google')).toBe('Marketing');
    expect(service.categorizeTransaction('OpenAI API platform tokens', 'OpenAI')).toBe('Software & SaaS');
  });

  it('should flag abnormal transactions as anomalies', () => {
    const anomaly = service.evaluateAnomaly(75000, 'Software & SaaS');
    expect(anomaly.isAnomaly).toBe(true);
    expect(anomaly.score).toBeGreaterThan(0.5);
  });
});
