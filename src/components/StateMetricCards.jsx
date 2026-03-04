/**
 * StateMetricCards - Dynamic cards showing state-specific metrics
 * Appears when user hovers or clicks on a state
 */

import { useState, useEffect } from 'react';

export default function StateMetricCards() {
  const [stateName, setStateName] = useState(null);
  const [stateData, setStateData] = useState(null);

  useEffect(() => {
    const handleUpdateMetrics = (event) => {
      const { stateName: name, stateData: data } = event.detail;
      setStateName(name);
      setStateData(data);
    };

    window.addEventListener('updateStateMetrics', handleUpdateMetrics);

    return () => {
      window.removeEventListener('updateStateMetrics', handleUpdateMetrics);
    };
  }, []);

  if (!stateName || !stateData) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p className="text-lg">👆 Click on a state above to see detailed metrics</p>
      </div>
    );
  }

  const metrics = [
    {
      label: 'Graduate Employment Rate',
      value: stateData.graduateEmploymentRate,
      format: (v) => `${v?.toFixed(1)}%`,
      color: 'green',
      icon: '🎓'
    },
    {
      label: 'Total Graduates Produced',
      value: stateData.totalGraduatesProduced,
      format: (v) => v?.toLocaleString(),
      color: 'blue',
      icon: '👥'
    },
    {
      label: 'Graduates Employed',
      value: stateData.graduatesEmployed,
      format: (v) => v?.toLocaleString(),
      color: 'teal',
      icon: '💼'
    },
    {
      label: 'Employment Absorption Rate',
      value: stateData.employmentAbsorptionRate,
      format: (v) => `${v?.toFixed(1)}%`,
      color: 'purple',
      icon: '📊'
    },
    {
      label: 'Unemployment Rate',
      value: stateData.unemployment_rate,
      format: (v) => `${v?.toFixed(1)}%`,
      color: 'red',
      icon: '📉'
    },
    {
      label: 'Mean Household Income',
      value: stateData.mean_income,
      format: (v) => `RM ${v?.toLocaleString()}`,
      color: 'amber',
      icon: '💰'
    },
    {
      label: 'Labour Force Participation',
      value: stateData.participation_rate,
      format: (v) => `${v?.toFixed(1)}%`,
      color: 'indigo',
      icon: '👷'
    },
    {
      label: 'Gini Coefficient',
      value: stateData.gini,
      format: (v) => v?.toFixed(3),
      color: 'rose',
      icon: '⚖️'
    }
  ];

  const colorClasses = {
    green: 'border-green-500',
    blue: 'border-blue-500',
    teal: 'border-teal-500',
    purple: 'border-purple-500',
    red: 'border-red-500',
    amber: 'border-amber-500',
    indigo: 'border-indigo-500',
    rose: 'border-rose-500'
  };

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          {stateName}
        </h3>
        <p className="text-gray-600">State Metrics Overview</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <div
            key={index}
            className={`bg-white rounded-lg shadow-md p-5 border-l-4 ${colorClasses[metric.color]} transform transition-all duration-300 hover:scale-105 hover:shadow-lg`}
          >
            <div className="flex items-start justify-between mb-3">
              <h4 className="text-sm font-medium text-gray-600 leading-tight">
                {metric.label}
              </h4>
              <span className="text-2xl">{metric.icon}</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">
              {metric.value !== null && metric.value !== undefined
                ? metric.format(metric.value)
                : 'N/A'}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Click on other states to compare metrics</p>
      </div>
    </div>
  );
}
