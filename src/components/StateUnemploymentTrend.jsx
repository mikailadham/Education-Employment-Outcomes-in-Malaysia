/**
 * StateUnemploymentTrend - Compare graduate unemployment rates across states over time
 * Shows trends from 2020-2024 with ability to select and compare multiple states
 */

import { useState, useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import graduateData from '../data/GRADUATES_STATISTICS/graduate-tracer-processed.json';

// Color palette for different states
const STATE_COLORS = {
  'Johor': '#3b82f6',
  'Kedah': '#8b5cf6',
  'Kelantan': '#ef4444',
  'Melaka': '#f59e0b',
  'Negeri Sembilan': '#10b981',
  'Pahang': '#06b6d4',
  'Pulau Pinang': '#ec4899',
  'Perak': '#f97316',
  'Perlis': '#84cc16',
  'Selangor': '#6366f1',
  'Terengganu': '#14b8a6',
  'Sabah': '#dc2626',
  'Sarawak': '#eab308',
  'WP Kuala Lumpur': '#8b5cf6',
  'WP Labuan': '#0ea5e9',
  'WP Putrajaya': '#22c55e'
};

export default function StateUnemploymentTrend() {
  // Start with just one state (Selangor as reference)
  const [selectedStates, setSelectedStates] = useState(['Selangor']);

  // Get all states from data
  const allStates = graduateData.byState.map(s => s.state);

  // Transform data for the chart
  const chartData = useMemo(() => {
    const years = [2020, 2021, 2022, 2023, 2024];

    return years.map(year => {
      const yearData = { year };

      graduateData.byState.forEach(stateObj => {
        const rate = stateObj.unemploymentByYear[year]?.pct || 0;
        yearData[stateObj.state] = rate;
      });

      return yearData;
    });
  }, []);

  // Calculate stats for selected states
  const stats = useMemo(() => {
    const latest2024 = chartData[chartData.length - 1]; // 2024 data
    const earliest2020 = chartData[0]; // 2020 data

    const selectedStateStats = selectedStates.map(state => {
      const rate2024 = latest2024[state];
      const rate2020 = earliest2020[state];
      const change = rate2024 - rate2020;

      return {
        state,
        rate2024,
        rate2020,
        change,
        color: STATE_COLORS[state]
      };
    }).sort((a, b) => b.rate2024 - a.rate2024); // Sort by 2024 rate descending

    // Calculate difference from highest unemployment state
    const highestRate = selectedStateStats[0]?.rate2024 || 0;
    selectedStateStats.forEach(stat => {
      stat.diffFromHighest = stat.rate2024 - highestRate;
    });

    return selectedStateStats;
  }, [selectedStates, chartData]);

  const toggleState = (state) => {
    setSelectedStates(prev => {
      if (prev.includes(state)) {
        // Don't allow deselecting if it's the last one
        if (prev.length === 1) return prev;
        return prev.filter(s => s !== state);
      } else {
        return [...prev, state];
      }
    });
  };

  const selectAll = () => {
    setSelectedStates(allStates);
  };

  const clearAll = () => {
    // Reset to minimal selection (one state)
    setSelectedStates(['Selangor']);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const sortedPayload = payload.sort((a, b) => b.value - a.value);
      const highestRate = sortedPayload[0]?.value || 0;

      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg max-w-xs">
          <p className="font-bold text-gray-900 mb-2">{label}</p>
          <div className="space-y-1.5">
            {sortedPayload.map((entry, index) => {
              const diff = entry.value - highestRate;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm text-gray-700">{entry.name}:</span>
                    </div>
                    <span className="text-sm font-semibold" style={{ color: entry.color }}>
                      {entry.value.toFixed(1)}%
                    </span>
                  </div>
                  {index > 0 && (
                    <div className="ml-5 text-xs text-blue-600">
                      {diff.toFixed(1)}pp vs {sortedPayload[0].name}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          {label === '2024' && (
            <p className="text-xs text-amber-600 mt-2 pt-2 border-t border-gray-200">
              ⚠️ 2024 uses revised methodology
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200">
      <div className="p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Graduate Unemployment by State — Trends Over Time
        </h2>
        <p className="text-sm text-gray-600 mb-6">
          Compare how graduate unemployment rates have changed from 2020 to 2024. Select states to compare.
        </p>

        {/* State Selector */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Select States to Compare ({selectedStates.length} selected):
            </h3>
            <div className="flex gap-2">
              <button
                onClick={selectAll}
                className="px-3 py-1 text-xs font-medium text-teal-700 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors"
              >
                Select All
              </button>
              <button
                onClick={clearAll}
                className="px-3 py-1 text-xs font-medium text-gray-700 bg-gray-50 hover:bg-gray-100 border border-gray-300 rounded-lg transition-colors"
              >
                Clear All
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
            {allStates.map(state => (
              <button
                key={state}
                onClick={() => toggleState(state)}
                className={`
                  text-left px-3 py-2 rounded-lg text-xs font-medium
                  transition-all duration-200 border
                  ${selectedStates.includes(state)
                    ? 'border-2 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border-gray-200'
                  }
                `}
                style={selectedStates.includes(state) ? {
                  backgroundColor: STATE_COLORS[state],
                  borderColor: STATE_COLORS[state]
                } : {}}
              >
                {state}
                {selectedStates.includes(state) && (
                  <span className="ml-1">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Line Chart */}
        <ResponsiveContainer width="100%" height={450}>
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="year"
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              label={{
                value: 'Year',
                position: 'insideBottom',
                offset: -10,
                style: { fill: '#6b7280', fontSize: 12 }
              }}
            />
            <YAxis
              stroke="#6b7280"
              tick={{ fill: '#6b7280', fontSize: 12 }}
              domain={[0, 'auto']}
              label={{
                value: 'Unemployment Rate (%)',
                angle: -90,
                position: 'insideLeft',
                style: { fill: '#6b7280', fontSize: 12 }
              }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
            />
            {selectedStates.map(state => (
              <Line
                key={state}
                type="monotone"
                dataKey={state}
                name={state}
                stroke={STATE_COLORS[state]}
                strokeWidth={2.5}
                dot={{ fill: STATE_COLORS[state], r: 4 }}
                activeDot={{ r: 6 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>

        {/* Summary Stats */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            2024 Rankings (Selected States):
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.map((stat, index) => (
              <div
                key={stat.state}
                className="p-4 rounded-lg border-l-4"
                style={{
                  borderLeftColor: stat.color,
                  backgroundColor: `${stat.color}08`
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <p className="font-semibold text-gray-900 text-sm">
                    {index + 1}. {stat.state}
                  </p>
                  <div
                    className="w-3 h-3 rounded-full mt-1"
                    style={{ backgroundColor: stat.color }}
                  />
                </div>
                <p className="text-2xl font-bold mb-1" style={{ color: stat.color }}>
                  {stat.rate2024.toFixed(1)}%
                </p>
                <p className="text-xs text-gray-600 mb-1">
                  2020: {stat.rate2020.toFixed(1)}%
                  <span className={`ml-2 font-semibold ${stat.change < 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change > 0 ? '+' : ''}{stat.change.toFixed(1)}pp
                  </span>
                </p>
                {index > 0 && (
                  <p className="text-xs font-semibold text-blue-600">
                    {stat.diffFromHighest.toFixed(1)}pp vs {stats[0].state}
                  </p>
                )}
                {index === 0 && (
                  <p className="text-xs font-semibold text-orange-600">
                    Highest unemployment
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Methodology Note */}
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs text-amber-800">
            <strong>⚠️ Methodology Change:</strong> 2024 data uses a revised binary methodology (Employed vs Not Working Yet)
            and is not directly comparable to 2020-2023 data which used a 5-category classification.
          </p>
        </div>
      </div>
    </div>
  );
}
