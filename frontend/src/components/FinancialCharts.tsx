import React from 'react';
import type { DepartmentBudget, CashFlowForecastDay } from '../types';

interface FinancialChartsProps {
  budgets: DepartmentBudget[];
  forecast: CashFlowForecastDay[];
}

export const FinancialCharts: React.FC<FinancialChartsProps> = ({
  budgets,
  forecast,
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* 1. Cash Flow 14-Day Forward Forecast Chart */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">14-Day Cash Flow Forecast</h3>
            <p className="text-xs text-gray-500">Projected daily balance curve with scheduled AP/AR spikes</p>
          </div>
          <span className="text-xs font-mono bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-sm">
            Cash Agent Model
          </span>
        </div>

        <div className="space-y-2 mt-4">
          {forecast.slice(0, 7).map((f) => {
            const isPayroll = f.projectedOutflow > 50000;
            return (
              <div key={f.date} className="flex items-center justify-between text-xs py-1 border-b border-gray-100">
                <span className="font-mono text-gray-600 w-24">{f.date}</span>
                <div className="flex-1 px-4 flex items-center space-x-2">
                  <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden flex">
                    <div
                      className="bg-indigo-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, Math.max(10, (f.projectedBalance / 750000) * 100))}%` }}
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-3 text-right">
                  <span className={`font-mono ${isPayroll ? 'text-rose-600 font-semibold' : 'text-gray-500'}`}>
                    Out: ${f.projectedOutflow.toLocaleString()}
                  </span>
                  <span className="font-mono font-medium text-gray-900 w-24">
                    ${f.projectedBalance.toLocaleString()}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Departmental Budget Utilization */}
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">Departmental Budget Allocations</h3>
            <p className="text-xs text-gray-500">Quarterly spend tracking and threshold enforcement</p>
          </div>
          <span className="text-xs font-mono bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-sm">
            Budget Agent
          </span>
        </div>

        <div className="space-y-4">
          {budgets.map((b) => {
            const isAlert = b.status === 'CRITICAL' || b.status === 'WARNING';
            return (
              <div key={b.department} className="space-y-1">
                <div className="flex justify-between items-center text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">{b.department}</span>
                    {b.status === 'CRITICAL' && (
                      <span className="bg-rose-100 text-rose-800 text-[10px] px-1.5 py-0.5 rounded-sm font-bold">
                        95%+ OVERRUN RISK
                      </span>
                    )}
                  </div>
                  <span className="text-gray-500">
                    ${b.spent.toLocaleString()} / ${b.allocated.toLocaleString()} ({b.utilizationPct}%)
                  </span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className={`h-2.5 rounded-full transition-all ${
                      b.status === 'CRITICAL'
                        ? 'bg-rose-500'
                        : isAlert
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.utilizationPct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
