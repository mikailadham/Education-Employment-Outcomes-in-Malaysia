/**
 * StateComparison - Multi-state comparison tool
 * Allows selecting 2-5 states and comparing their MyWI metrics side-by-side
 */

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import mywiByState from '../data/wellbeing/mywi-by-state.json';
import mywiLatest from '../data/wellbeing/mywi-latest.json';
import summaryData from '../data/summary-by-state.json';
import graduateData from '../data/graduates/graduate-employment-by-state-2024.json';

const STATE_COLORS = {
  0: '#14b8a6', // teal
  1: '#3b82f6', // blue
  2: '#10b981', // green
  3: '#f59e0b', // amber
  4: '#8b5cf6', // purple
  5: '#ef4444', // red
  6: '#06b6d4', // cyan
  7: '#ec4899'  // pink
};

export default function StateComparison() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedStates, setSelectedStates] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);

  // Merge summary data with graduate data (same as MalaysiaMap)
  const mergedData = {};
  Object.keys(summaryData).forEach(state => {
    mergedData[state] = {
      ...summaryData[state],
      ...graduateData[state]
    };
  });

  useEffect(() => {
    // Get all available states
    const states = Object.keys(mergedData).sort();
    setAvailableStates(states);
  }, []);

  const toggleState = (state) => {
    if (selectedStates.includes(state)) {
      setSelectedStates(selectedStates.filter(s => s !== state));
    } else {
      if (selectedStates.length < 5) {
        setSelectedStates([...selectedStates, state]);
      }
    }
  };

  const clearSelection = () => {
    setSelectedStates([]);
  };

  // Map WP states to Wilayah Persekutuan for MyWI data lookup
  const getMyWIStateName = (state) => {
    if (state === 'W.P. Kuala Lumpur' || state === 'W.P. Putrajaya' || state === 'W.P. Labuan') {
      return 'Wilayah Persekutuan';
    }
    return state;
  };

  // Prepare trend data for line chart
  const getTrendData = () => {
    if (selectedStates.length === 0) return [];

    const years = Object.keys(mywiByState[getMyWIStateName(selectedStates[0])] || {}).sort();

    return years.map(year => {
      const dataPoint = { year: parseInt(year) };
      selectedStates.forEach((state, index) => {
        const mywiState = getMyWIStateName(state);
        dataPoint[state] = mywiByState[mywiState]?.[year]?.overall;
      });
      return dataPoint;
    });
  };

  // Prepare sub-composite comparison data
  const getSubCompositeData = () => {
    if (selectedStates.length === 0) return [];

    return [
      {
        metric: 'Economic',
        ...selectedStates.reduce((acc, state, index) => {
          const mywiState = getMyWIStateName(state);
          acc[state] = mywiLatest[mywiState]?.economic;
          return acc;
        }, {})
      },
      {
        metric: 'Social',
        ...selectedStates.reduce((acc, state, index) => {
          const mywiState = getMyWIStateName(state);
          acc[state] = mywiLatest[mywiState]?.social;
          return acc;
        }, {})
      },
      {
        metric: 'Environmental',
        ...selectedStates.reduce((acc, state, index) => {
          const mywiState = getMyWIStateName(state);
          acc[state] = mywiLatest[mywiState]?.environmental;
          return acc;
        }, {})
      }
    ];
  };

  // Prepare radar chart data
  const getRadarData = () => {
    if (selectedStates.length === 0) return [];

    const components = ['education', 'working_life', 'income_distribution', 'housing', 'health', 'public_safety'];
    const labels = {
      education: 'Education',
      working_life: 'Working Life',
      income_distribution: 'Income',
      housing: 'Housing',
      health: 'Health',
      public_safety: 'Safety'
    };

    return components.map(comp => {
      const dataPoint = { component: labels[comp] };
      selectedStates.forEach(state => {
        const mywiState = getMyWIStateName(state);
        dataPoint[state] = mywiLatest[mywiState]?.components?.[comp] || 0;
      });
      return dataPoint;
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold">{entry.value?.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-6 md:p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            🔍 Compare States
          </h2>
          <p className="text-sm text-gray-600">
            Select 2-5 states to compare their well-being indicators side-by-side
          </p>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="px-4 py-2 bg-teal-600 text-white rounded-lg font-medium hover:bg-teal-700 transition-colors"
        >
          {isOpen ? 'Hide Selection' : 'Select States'}
        </button>
      </div>

      {/* State Selection Panel */}
      {isOpen && (
        <div className="bg-white rounded-lg p-6 mb-6 shadow-md">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-gray-700">
              Selected: <strong>{selectedStates.length}</strong> / 5 states
            </p>
            {selectedStates.length > 0 && (
              <button
                onClick={clearSelection}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Clear All
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {availableStates.map(state => {
              const isSelected = selectedStates.includes(state);
              const colorIndex = selectedStates.indexOf(state);

              return (
                <button
                  key={state}
                  onClick={() => toggleState(state)}
                  disabled={!isSelected && selectedStates.length >= 5}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isSelected
                      ? 'text-white shadow-md transform scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } ${!isSelected && selectedStates.length >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
                  style={isSelected ? { backgroundColor: STATE_COLORS[colorIndex] } : {}}
                >
                  {state}
                  {isSelected && <span className="ml-1">✓</span>}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Comparison Results */}
      {selectedStates.length === 0 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">👆 Select states to start comparing</p>
          <p className="text-gray-400 text-sm">Choose 2-5 states to see their trends and metrics</p>
        </div>
      ) : selectedStates.length === 1 ? (
        <div className="bg-white rounded-lg p-12 text-center">
          <p className="text-gray-500 text-lg mb-2">Add at least one more state</p>
          <p className="text-gray-400 text-sm">Comparison requires 2 or more states</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* MyWI Overall Trend Comparison */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              MyWI Overall Trend Comparison (2010-2024)
            </h3>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={getTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="year"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                  label={{ value: 'MyWI Overall', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 11 } }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedStates.map((state, index) => (
                  <Line
                    key={state}
                    type="monotone"
                    dataKey={state}
                    stroke={STATE_COLORS[index]}
                    strokeWidth={2}
                    dot={{ fill: STATE_COLORS[index], r: 3 }}
                    activeDot={{ r: 5 }}
                    animationDuration={1000}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Sub-Composite Comparison */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Sub-Composite Comparison (2024)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={getSubCompositeData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="metric"
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <YAxis
                  tick={{ fill: '#6b7280', fontSize: 11 }}
                  tickLine={{ stroke: '#e5e7eb' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedStates.map((state, index) => (
                  <Bar
                    key={state}
                    dataKey={state}
                    fill={STATE_COLORS[index]}
                    animationDuration={1000}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart for Key Components */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Key Components Comparison (2024)
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart data={getRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="component" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <PolarRadiusAxis angle={90} domain={[0, 150]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                {selectedStates.map((state, index) => (
                  <Radar
                    key={state}
                    name={state}
                    dataKey={state}
                    stroke={STATE_COLORS[index]}
                    fill={STATE_COLORS[index]}
                    fillOpacity={0.2}
                    animationDuration={1000}
                  />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Quick Stats Comparison */}
          <div className="bg-white rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Quick Stats (Latest Data)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-gray-700">Metric</th>
                    {selectedStates.map((state, index) => (
                      <th
                        key={state}
                        className="px-4 py-3 text-center font-medium"
                        style={{ color: STATE_COLORS[index] }}
                      >
                        {state}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {[
                    { label: 'MyWI Overall', key: 'mywi_overall', format: (v) => v?.toFixed(1) },
                    { label: 'Graduate Employment', key: 'graduateEmploymentRate', format: (v) => `${v?.toFixed(1)}%` },
                    { label: 'Unemployment Rate', key: 'unemployment_rate', format: (v) => `${v?.toFixed(1)}%` },
                    { label: 'Mean Income', key: 'mean_income', format: (v) => `RM ${v?.toLocaleString()}` },
                    { label: 'Gini Coefficient', key: 'gini', format: (v) => v?.toFixed(3) }
                  ].map(metric => (
                    <tr key={metric.key} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-700">{metric.label}</td>
                      {selectedStates.map(state => (
                        <td key={state} className="px-4 py-3 text-center text-gray-900">
                          {mergedData[state]?.[metric.key] !== undefined && mergedData[state]?.[metric.key] !== null
                            ? metric.format(mergedData[state][metric.key])
                            : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
