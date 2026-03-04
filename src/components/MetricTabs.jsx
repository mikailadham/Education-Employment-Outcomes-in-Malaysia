export default function MetricTabs({ selectedMetric, onMetricChange, metrics }) {
  const metricKeys = Object.keys(metrics);

  return (
    <div className="flex flex-wrap gap-2 justify-center">
      {metricKeys.map(key => (
        <button
          key={key}
          onClick={() => onMetricChange(key)}
          className={`px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 ${
            selectedMetric === key
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-gray-700 border border-gray-300 hover:border-teal-500 hover:text-teal-600'
          }`}
        >
          {metrics[key].label}
        </button>
      ))}
    </div>
  );
}
