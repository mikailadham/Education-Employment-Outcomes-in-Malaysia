import { useState, useEffect } from 'react';
import summaryData from '../data/summary-by-state.json';

export default function StateInfoPanel() {
  const [displayState, setDisplayState] = useState(null);

  useEffect(() => {
    const handleStateChange = (event) => {
      const { stateName } = event.detail;
      setDisplayState(stateName);
    };

    window.addEventListener('stateClick', handleStateChange);
    window.addEventListener('stateHover', handleStateChange);

    return () => {
      window.removeEventListener('stateClick', handleStateChange);
      window.removeEventListener('stateHover', handleStateChange);
    };
  }, []);

  if (!displayState) {
    return (
      <div className="bg-gray-50 rounded-lg p-5 border border-gray-200 text-center text-gray-500 h-full flex items-center justify-center">
        <p className="text-sm">Hover over or select a state to see its details</p>
      </div>
    );
  }

  const stateData = summaryData[displayState];
  if (!stateData) return null;

  const metrics = [
    { label: 'GDP Total', value: stateData.gdp_total, format: (v) => `RM ${v?.toFixed(2)}B (${stateData.gdp_year})` },
    { label: 'Mean Income', value: stateData.mean_income, format: (v) => `RM ${v?.toLocaleString()} (${stateData.income_year})` },
    { label: 'Median Income', value: stateData.median_income, format: (v) => `RM ${v?.toLocaleString()} (${stateData.income_year})` },
    { label: 'Gini Coefficient', value: stateData.gini, format: (v) => `${v?.toFixed(3)} (${stateData.gini_year})` },
    { label: 'Unemployment Rate', value: stateData.unemployment_rate, format: (v) => `${v?.toFixed(1)}% (${stateData.lfs_year})` },
    { label: 'Participation Rate', value: stateData.participation_rate, format: (v) => `${v?.toFixed(1)}% (${stateData.lfs_year})` },
    { label: 'School Completion', value: stateData.school_completion_rate, format: (v) => `${v?.toFixed(1)}% (${stateData.completion_year})` },
  ];

  return (
    <div className="bg-white rounded-lg shadow-xl p-5 border border-gray-200 h-full">
      <h3 className="font-bold text-xl mb-4 text-gray-900 border-b pb-2">
        {displayState}
      </h3>
      <div className="space-y-2">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className="flex justify-between text-sm text-gray-700"
          >
            <span className="text-gray-600">{metric.label}:</span>
            <span className="text-gray-900">
              {metric.value !== null && metric.value !== undefined ? metric.format(metric.value) : 'N/A'}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
