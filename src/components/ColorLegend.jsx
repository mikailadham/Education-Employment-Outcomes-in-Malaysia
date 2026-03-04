export default function ColorLegend({ min, max, colorScheme, label, format }) {
  const schemes = {
    teal: ['#ccfbf1', '#99f6e4', '#5eead4', '#2dd4bf', '#14b8a6', '#0d9488', '#0f766e'],
    blue: ['#dbeafe', '#bfdbfe', '#93c5fd', '#60a5fa', '#3b82f6', '#2563eb', '#1d4ed8'],
    red: ['#fee2e2', '#fecaca', '#fca5a5', '#f87171', '#ef4444', '#dc2626', '#b91c1c'],
    green: ['#d1fae5', '#a7f3d0', '#6ee7b7', '#34d399', '#10b981', '#059669', '#047857'],
    amber: ['#fef3c7', '#fde68a', '#fcd34d', '#fbbf24', '#f59e0b', '#d97706', '#b45309']
  };

  const colors = schemes[colorScheme] || schemes.teal;

  return (
    <div className="mt-6 flex flex-col items-center">
      <div className="text-sm font-medium text-gray-700 mb-2">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-600">{format(min)}</span>
        <div className="flex h-6 rounded overflow-hidden shadow-sm">
          {colors.map((color, idx) => (
            <div
              key={idx}
              style={{ backgroundColor: color, width: '40px' }}
              className="h-full"
            />
          ))}
        </div>
        <span className="text-xs text-gray-600">{format(max)}</span>
      </div>
    </div>
  );
}
