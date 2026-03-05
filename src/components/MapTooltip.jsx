export default function MapTooltip({ state, data, position, selectedMetric }) {
  if (!data) return null;

  const formatValue = (value, suffix = '') => {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'number') {
      return `${value.toLocaleString()}${suffix}`;
    }
    return value;
  };

  const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'N/A';
    return `RM ${value.toLocaleString()}`;
  };

  const metrics = [
    { label: 'GDP Total', value: data.gdp_total, format: (v) => `${formatValue(v, 'B')} (${data.gdp_year})` },
    { label: 'Mean Income', value: data.mean_income, format: (v) => `${formatCurrency(v)} (${data.income_year})` },
    { label: 'Median Income', value: data.median_income, format: (v) => `${formatCurrency(v)} (${data.income_year})` },
    { label: 'Gini Coefficient', value: data.gini, format: (v) => `${formatValue(v?.toFixed(3))} (${data.gini_year})` },
    { label: 'Unemployment Rate', value: data.unemployment_rate, format: (v) => `${formatValue(v?.toFixed(1), '%')} (${data.lfs_year})` },
    { label: 'Participation Rate', value: data.participation_rate, format: (v) => `${formatValue(v?.toFixed(1), '%')} (${data.lfs_year})` },
    { label: 'School Completion', value: data.school_completion_rate, format: (v) => `${formatValue(v?.toFixed(1), '%')} (${data.completion_year})` },
  ];

  return (
    <div
      className="absolute bg-white/90 backdrop-blur-sm shadow-xl rounded-lg p-4 pointer-events-none z-50 border border-gray-200"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        minWidth: '280px',
        maxWidth: '320px'
      }}
    >
      <h3 className="font-bold text-lg mb-3 text-gray-900 border-b pb-2">{state}</h3>
      <div className="space-y-2">
        {metrics.map((metric, idx) => {
          const isSelected =
            (selectedMetric === 'gdp_total' && metric.label === 'GDP Total') ||
            (selectedMetric === 'mean_income' && metric.label === 'Mean Income') ||
            (selectedMetric === 'median_income' && metric.label === 'Median Income') ||
            (selectedMetric === 'gini' && metric.label === 'Gini Coefficient') ||
            (selectedMetric === 'unemployment_rate' && metric.label === 'Unemployment Rate') ||
            (selectedMetric === 'participation_rate' && metric.label === 'Participation Rate') ||
            (selectedMetric === 'school_completion_rate' && metric.label === 'School Completion');

          return (
            <div
              key={idx}
              className={`flex justify-between text-sm ${
                isSelected ? 'font-semibold text-teal-700 bg-teal-50 px-2 py-1 rounded' : 'text-gray-700'
              }`}
            >
              <span className="text-gray-600">{metric.label}:</span>
              <span className={isSelected ? 'text-teal-700' : 'text-gray-900'}>
                {metric.format(metric.value)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
