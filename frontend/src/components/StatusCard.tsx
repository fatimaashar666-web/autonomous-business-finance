interface StatusCardProps {
  title: string;
  value: string;
  accent?: 'green' | 'red' | 'yellow' | 'blue';
}

const accentStyles = {
  green: 'border-green-400 bg-green-50 text-green-700',
  red: 'border-red-400 bg-red-50 text-red-700',
  yellow: 'border-yellow-400 bg-yellow-50 text-yellow-700',
  blue: 'border-indigo-400 bg-indigo-50 text-indigo-700',
};

/**
 * Reusable card for displaying a labelled status value.
 */
export default function StatusCard({ title, value, accent = 'blue' }: StatusCardProps) {
  return (
    <div
      className={`rounded-lg border-l-4 p-4 shadow-sm ${accentStyles[accent]}`}
    >
      <p className="text-sm font-medium opacity-75">{title}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  );
}
