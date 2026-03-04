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
    // Well-Being Section
    {
      label: 'MyWI Overall Index',
      value: stateData.mywi_overall,
      format: (v) => v?.toFixed(1),
      color: 'teal',
      icon: '✨',
      section: 'Well-Being'
    },
    {
      label: 'MyWI Economic',
      value: stateData.mywi_economic,
      format: (v) => v?.toFixed(1),
      color: 'blue',
      icon: '📈',
      section: 'Well-Being'
    },
    {
      label: 'MyWI Social',
      value: stateData.mywi_social,
      format: (v) => v?.toFixed(1),
      color: 'green',
      icon: '🤝',
      section: 'Well-Being'
    },
    {
      label: 'MyWI Environmental',
      value: stateData.mywi_environmental,
      format: (v) => v?.toFixed(1),
      color: 'green',
      icon: '🌿',
      section: 'Well-Being'
    },
    // Education & Employment Section
    {
      label: 'MyWI Education',
      value: stateData.mywi_education,
      format: (v) => v?.toFixed(1),
      color: 'blue',
      icon: '🎓',
      section: 'Education'
    },
    {
      label: 'MyWI Working Life',
      value: stateData.mywi_working_life,
      format: (v) => v?.toFixed(1),
      color: 'teal',
      icon: '💼',
      section: 'Education'
    },
    {
      label: 'Graduate Employment Rate',
      value: stateData.graduateEmploymentRate,
      format: (v) => `${v?.toFixed(1)}%`,
      color: 'green',
      icon: '👨‍🎓',
      section: 'Education'
    },
    {
      label: 'Unemployment Rate',
      value: stateData.unemployment_rate,
      format: (v) => `${v?.toFixed(1)}%`,
      color: 'red',
      icon: '📉',
      section: 'Education'
    },
    // Economic Context Section
    {
      label: 'MyWI Income & Distribution',
      value: stateData.mywi_income_distribution,
      format: (v) => v?.toFixed(1),
      color: 'teal',
      icon: '💵',
      section: 'Economic'
    },
    {
      label: 'Mean Household Income',
      value: stateData.mean_income,
      format: (v) => `RM ${v?.toLocaleString()}`,
      color: 'amber',
      icon: '💰',
      section: 'Economic'
    },
    {
      label: 'Labour Force Participation',
      value: stateData.participation_rate,
      format: (v) => `${v?.toFixed(1)}%`,
      color: 'indigo',
      icon: '👷',
      section: 'Economic'
    },
    {
      label: 'Gini Coefficient',
      value: stateData.gini,
      format: (v) => v?.toFixed(3),
      color: 'rose',
      icon: '⚖️',
      section: 'Economic'
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

  // Group metrics by section
  const wellbeingMetrics = metrics.filter(m => m.section === 'Well-Being');
  const educationMetrics = metrics.filter(m => m.section === 'Education');
  const economicMetrics = metrics.filter(m => m.section === 'Economic');

  const MetricCard = ({ metric }) => (
    <div
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
  );

  return (
    <div className="animate-fadeIn">
      <div className="text-center mb-8">
        <h3 className="text-3xl font-bold text-gray-900 mb-2">
          {stateName}
        </h3>
        <p className="text-gray-600">Well-Being, Education & Economic Indicators</p>
      </div>

      {/* Well-Being Section */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-teal-600">✨</span>
          <span>Well-Being (MyWI Index)</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {wellbeingMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Base year 2010 = 100. Values above 100 indicate improvement since 2010.
        </p>
      </div>

      {/* Education & Employment Section */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-blue-600">🎓</span>
          <span>Education & Employment</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {educationMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Economic Context Section */}
      <div className="mb-8">
        <h4 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-amber-600">💰</span>
          <span>Economic Context</span>
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {economicMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      <div className="mt-6 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600">
          💡 Click on other states on the map or list to compare metrics
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Data sources: DOSM MyWI 2024, Labour Force Survey 2023, Graduate Tracer Study 2024
        </p>
      </div>
    </div>
  );
}
