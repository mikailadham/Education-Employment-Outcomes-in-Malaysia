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

  const MetricCard = ({ metric }) => {
    const isUnemployment = metric.label === 'Unemployment Rate';
    const borderColor = isUnemployment ? 'border-red-500' : 'border-teal-500';
    const textColor = isUnemployment ? 'text-red-700' : 'text-gray-900';

    return (
      <div className={`bg-white rounded-lg p-4 border-l-4 ${borderColor} border border-gray-200`}>
        <div className="flex items-start justify-between mb-2">
          <p className="text-xs text-gray-600 font-medium">
            {metric.label}
          </p>
          <span className="text-lg">{metric.icon}</span>
        </div>
        <p className={`text-2xl font-bold ${textColor}`}>
          {metric.value !== null && metric.value !== undefined
            ? metric.format(metric.value)
            : 'N/A'}
        </p>
      </div>
    );
  };

  return (
    <div className="animate-fadeIn space-y-4">
      {/* Well-Being Section */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>✨</span>
          <span>Well-Being (MyWI Index)</span>
        </h4>
        <div className="space-y-3">
          {wellbeingMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Education & Employment Section */}
      <div>
        <h4 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
          <span>🎓</span>
          <span>Education & Employment</span>
        </h4>
        <div className="space-y-3">
          {educationMetrics.map((metric, index) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </div>

      {/* Economic Context Section - Keep as horizontal row */}
      <div className="mt-6">
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
    </div>
  );
}
