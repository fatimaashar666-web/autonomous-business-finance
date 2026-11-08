import type { ReactNode } from 'react';
import { useTheme } from '../utils';
import { FloatingChatbot } from '../components';

interface MainLayoutProps {
  children: ReactNode;
}

const currentYear = new Date().getFullYear();

/**
 * Top-level page shell — header, scrollable content area, and footer.
 * All pages are rendered inside this layout.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 dark:bg-slate-950 text-gray-900 dark:text-slate-100 transition-colors duration-200">
      {/* ── Top Executive Header ─────────────────────────────────── */}
      <header className="border-b border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold shadow-sm">
              ⚡
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-gray-900 dark:text-white sm:text-xl">
                Autonomous Business Finance
              </h1>
              <p className="text-[11px] text-gray-500 dark:text-slate-400 hidden sm:block">
                Industrial-Grade Multi-Agent AI Platform
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Dark / Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label="Toggle Dark and Light Mode"
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              {theme === 'dark' ? (
                <span className="text-sm" title="Switch to Light Mode">🌞</span>
              ) : (
                <span className="text-sm" title="Switch to Dark Mode">🌙</span>
              )}
            </button>

            <div className="hidden md:flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs px-2.5 py-1 rounded-full">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Multi-Agent Core Online</span>
            </div>

            <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-3 py-1 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
              CFO Portal
            </span>
          </div>
        </div>
      </header>

      {/* ── Main content (contains the NavigationBar and active views) ── */}
      <main className="w-full flex-1">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors mt-12">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-xs text-gray-500 dark:text-slate-400 sm:px-6 lg:px-8">
          &copy; {currentYear} Autonomous Business Finance Platform • Coordinated Multi-Agent Architecture
        </div>
      </footer>

      <FloatingChatbot />
    </div>
  );
}
