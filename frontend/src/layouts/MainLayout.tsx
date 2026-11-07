import type { ReactNode } from 'react';

interface MainLayoutProps {
  children: ReactNode;
}

const currentYear = new Date().getFullYear();

/**
 * Top-level page shell — header, scrollable content area, and footer.
 * All pages are rendered inside this layout.
 */
export default function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50 text-gray-900">
      {/* ── Header ─────────────────────────────────────────────── */}
      <header className="border-b border-gray-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-xl font-bold tracking-tight text-indigo-600 sm:text-2xl">
            Autonomous Business Finance Platform
          </h1>
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-indigo-700">
            Phase 1
          </span>
        </div>
      </header>

      {/* ── Main content ───────────────────────────────────────── */}
      <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>

      {/* ── Footer ─────────────────────────────────────────────── */}
      <footer className="border-t border-gray-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 text-center text-sm text-gray-500 sm:px-6 lg:px-8">
          &copy; {currentYear} Autonomous Business Finance Platform
        </div>
      </footer>
    </div>
  );
}
