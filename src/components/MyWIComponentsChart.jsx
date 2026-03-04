/**
 * MyWIComponentsChart - Interactive bar chart showing all 16 MyWI components
 * Color-coded by sub-composite (Economic, Social, Environmental)
 */

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';
import mywiLatest from '../data/wellbeing/mywi-latest.json';

export default function MyWIComponentsChart() {
  const [stateName, setStateName] = useState(null);
  const [chartData, setChartData] = useState([]);

  // Listen for chart update events
  useEffect(() => {
    const handleChartUpdate = (event) => {
      const { stateName: name } = event.detail;
      setStateName(name);
    };

    window.addEventListener('updateMyWIChart', handleChartUpdate);
    return () => window.removeEventListener('updateMyWIChart', handleChartUpdate);
  }, []);

  // Update chart data when state changes
  useEffect(() => {
    if (!stateName) {
      setChartData([]);
      return;
    }

    // Handle Wilayah Persekutuan mapping
    let lookupName = stateName;
    if (stateName === 'W.P. Kuala Lumpur' || stateName === 'W.P. Putrajaya' || stateName === 'W.P. Labuan') {
      lookupName = 'Wilayah Persekutuan';
    }

    if (!mywiLatest[lookupName]) {
      setChartData([]);
      return;
    }

    const components = mywiLatest[lookupName].components;

    // Component metadata with sub-composite classification
    const componentMeta = [
      // Economic (4 components)
      { key: 'transportation', label: 'Transportation', type: 'Economic', color: '#3b82f6' },
      { key: 'communication', label: 'Communication', type: 'Economic', color: '#3b82f6' },
      { key: 'income_distribution', label: 'Income & Distribution', type: 'Economic', color: '#3b82f6' },
      { key: 'working_life', label: 'Working Life', type: 'Economic', color: '#3b82f6' },

      // Social (9 components)
      { key: 'education', label: 'Education', type: 'Social', color: '#10b981' },
      { key: 'housing', label: 'Housing', type: 'Social', color: '#10b981' },
      { key: 'entertainment', label: 'Entertainment & Recreation', type: 'Social', color: '#10b981' },
      { key: 'public_safety', label: 'Public Safety', type: 'Social', color: '#10b981' },
      { key: 'social_participation', label: 'Social Participation', type: 'Social', color: '#10b981' },
      { key: 'governance', label: 'Governance', type: 'Social', color: '#10b981' },
      { key: 'culture', label: 'Culture', type: 'Social', color: '#10b981' },
      { key: 'health', label: 'Health', type: 'Social', color: '#10b981' },
      { key: 'family', label: 'Family', type: 'Social', color: '#10b981' },

      // Environmental (3 components)
      { key: 'air', label: 'Air Quality', type: 'Environmental', color: '#84cc16' },
      { key: 'water', label: 'Water Quality', type: 'Environmental', color: '#84cc16' },
      { key: 'biodiversity', label: 'Biodiversity Resources', type: 'Environmental', color: '#84cc16' }
    ];

    const data = componentMeta.map(meta => ({
      label: meta.label,
      value: components[meta.key],
      type: meta.type,
      color: meta.color,
      above100: components[meta.key] > 100
    }));

    // Sort by value descending
    data.sort((a, b) => b.value - a.value);

    setChartData(data);
  }, [stateName]);

  if (!chartData.length) {
    return null;
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-1">{data.label}</p>
        <p className="text-2xl font-bold" style={{ color: data.color }}>
          {data.value.toFixed(1)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {data.type} sub-composite
        </p>
        <p className="text-xs text-gray-500">
          {data.above100 ? `+${(data.value - 100).toFixed(1)}` : `${(data.value - 100).toFixed(1)}`} since 2010
        </p>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl mt-6">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {stateName} — MyWI Component Breakdown (2024)
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          All 16 components across 3 sub-composites. Hover to see details.
        </p>

        {/* Legend */}
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-blue-500"></div>
            <span className="text-gray-700">Economic (4)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-green-500"></div>
            <span className="text-gray-700">Social (9)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-lime-500"></div>
            <span className="text-gray-700">Environmental (3)</span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{ value: 'Index Value (2010 = 100)', position: 'insideBottom', offset: -5, style: { fill: '#6b7280', fontSize: 11 } }}
          />
          <YAxis
            type="category"
            dataKey="label"
            tick={{ fill: '#374151', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            width={140}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f9fafb' }} />

          {/* Base year reference line */}
          <ReferenceLine
            x={100}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{ value: 'Base', position: 'top', fill: '#9ca3af', fontSize: 10 }}
          />

          <Bar dataKey="value" radius={[0, 4, 4, 0]} animationDuration={1000}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 font-medium mb-1">Highest Component</p>
          <p className="text-lg font-bold text-blue-900">{chartData[0].label}</p>
          <p className="text-sm text-blue-700">{chartData[0].value.toFixed(1)}</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-xs text-gray-600 font-medium mb-1">Median Component</p>
          <p className="text-lg font-bold text-gray-900">
            {chartData[Math.floor(chartData.length / 2)].label}
          </p>
          <p className="text-sm text-gray-700">
            {chartData[Math.floor(chartData.length / 2)].value.toFixed(1)}
          </p>
        </div>
        <div className="bg-amber-50 rounded-lg p-4">
          <p className="text-xs text-amber-600 font-medium mb-1">Improvement Opportunity</p>
          <p className="text-lg font-bold text-amber-900">
            {chartData[chartData.length - 1].label}
          </p>
          <p className="text-sm text-amber-700">
            {chartData[chartData.length - 1].value.toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  );
}
