import React from 'react';

export type NavTab = 'overview' | 'assistant' | 'approvals' | 'analytics' | 'ledger' | 'audit';

interface NavigationBarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingApprovalsCount?: number;
  anomaliesCount?: number;
}

export const NavigationBar: React.FC<NavigationBarProps> = ({
  activeTab,
  onSelectTab,
  pendingApprovalsCount = 0,
  anomaliesCount = 0,
}) => {
  const navItems: { id: NavTab; label: string; icon: string; badge?: number; badgeColor?: string }[] = [
    {
      id: 'overview',
      label: 'Financial Overview',
      icon: '📊',
    },
    {
      id: 'assistant',
      label: 'AI Finance Assistant',
      icon: '🤖',
    },
    {
      id: 'approvals',
      label: 'Approval Gate',
      icon: '🛡️',
      badge: pendingApprovalsCount,
      badgeColor: 'bg-amber-500 text-white',
    },
    {
      id: 'analytics',
      label: 'Cash Flow & Budgets',
      icon: '📈',
    },
    {
      id: 'ledger',
      label: 'Live Ledger',
      icon: '💳',
      badge: anomaliesCount > 0 ? anomaliesCount : undefined,
      badgeColor: 'bg-rose-500 text-white',
    },
    {
      id: 'audit',
      label: 'Agent Audit Trail',
      icon: '📝',
    },
  ];

  return (
    <nav className="bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 sticky top-0 z-30 shadow-2xs transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-1 sm:space-x-3 overflow-x-auto py-2.5 scrollbar-none">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onSelectTab(item.id)}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-gray-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/70 dark:hover:bg-slate-800'
                }`}
              >
                <span className="text-base">{item.icon}</span>
                <span>{item.label}</span>
                {Boolean(item.badge && item.badge > 0) && (
                  <span
                    className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                      isActive ? 'bg-white text-indigo-700' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};
