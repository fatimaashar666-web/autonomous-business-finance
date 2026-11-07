interface StatusCardProps {
  title: string;
  value: string;
  accent?: 'green' | 'red' | 'yellow' | 'blue';
}

const accentStyles = {
  green: 'border-green-400 bg-green-50 dark:bg-emerald-950/30 text-green-700 dark:text-emerald-400 dark:border-emerald-500',
  red: 'border-red-400 bg-red-50 dark:bg-rose-950/30 text-red-700 dark:text-rose-400 dark:border-rose-500',
  yellow: 'border-yellow-400 bg-yellow-50 dark:bg-amber-950/30 text-yellow-700 dark:text-amber-400 dark:border-amber-500',
  blue: 'border-indigo-400 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-400 dark:border-indigo-500',
};

/**
 * Reusable card for displaying a labelled status value.
 */
export default function StatusCard({ title, value, accent = 'blue' }: StatusCardProps) {
  return (
    <div
      className={`rounded-xl border-l-4 p-4 shadow-xs transition-colors ${accentStyles[accent]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wider opacity-80">{title}</p>
      <p className="mt-1 text-2xl font-bold tracking-tight">{value}</p>
    </div>
  );
}
