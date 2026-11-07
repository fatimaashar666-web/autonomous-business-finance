import React from 'react';
import type { AgentAction } from '../types';

interface ActionApprovalsProps {
  actions: AgentAction[];
  onApprove: (actionId: string, approved: boolean) => Promise<boolean>;
}

export const ActionApprovals: React.FC<ActionApprovalsProps> = ({ actions, onApprove }) => {
  const pendingActions = actions.filter((a) => a.status === 'PENDING_APPROVAL');

  if (pendingActions.length === 0) {
    return (
      <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm text-center">
        <div className="inline-flex items-center justify-center h-10 w-10 rounded-full bg-emerald-50 text-emerald-600 mb-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h4 className="text-sm font-semibold text-gray-800">All Operations Clear</h4>
        <p className="text-xs text-gray-500 mt-1">No autonomous financial actions currently awaiting human approval.</p>
      </div>
    );
  }

  return (
    <div className="bg-amber-50/60 rounded-xl p-5 border border-amber-200/80 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 animate-ping" />
          <h4 className="text-sm font-bold text-amber-900 tracking-wide">
            Human-In-The-Loop Approval Required ({pendingActions.length})
          </h4>
        </div>
        <span className="text-[11px] font-medium bg-amber-100 text-amber-800 px-2 py-0.5 rounded-md">
          Week 7 Security Gate
        </span>
      </div>

      <div className="space-y-3">
        {pendingActions.map((act) => (
          <div
            key={act.id}
            className="bg-white rounded-lg p-4 border border-amber-200 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3"
          >
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-sm bg-indigo-50 text-indigo-700">
                  {act.agentName}
                </span>
                <span className="text-xs font-mono text-gray-400">ID: {act.id}</span>
              </div>
              <p className="text-sm font-medium text-gray-800 mt-1">{act.description}</p>
              {act.reasoning && (
                <p className="text-xs text-gray-600 mt-0.5 italic">"Reason: {act.reasoning}"</p>
              )}
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <button
                type="button"
                onClick={() => onApprove(act.id, false)}
                className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
              >
                Reject Action
              </button>
              <button
                type="button"
                onClick={() => onApprove(act.id, true)}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-2xs transition-colors"
              >
                Authorize & Execute
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
