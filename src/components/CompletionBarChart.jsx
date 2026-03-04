/**
 * CompletionBarChart - School Completion Rates by State
 * Sortable horizontal bar chart showing school completion rates
 */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import summaryData from '../data/summary-by-state.json';

export default function CompletionBarChart() {
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' or 'desc'

  // Prepare data
  const data = Object.entries(summaryData)
    .filter(([state, data]) => data.school_completion_rate !== null && data.school_completion_rate !== undefined)
    .map(([state, data]) => ({
      state: state.replace('W.P. ', ''),
      rate: Math.round(data.school_completion_rate * 10) / 10
    }));

  // Sort data
  const sortedData = [...data].sort((a, b) => {
    return sortOrder === 'desc' ? b.rate - a.rate : a.rate - b.rate;
  });

  const toggleSort = () => {
    setSortOrder(prev => prev === 'desc' ? 'asc' : 'desc');
  };

  const getBarColor = (rate) => {
    if (rate >= 100) return '#10b981'; // Green
    if (rate >= 98) return '#3b82f6'; // Blue
    return '#f59e0b'; // Orange
  };

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{data.state}</p>
          <p className="text-sm text-gray-600">
            Completion Rate: <span className="font-bold">{data.rate}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  const avgRate = (data.reduce((sum, d) => sum + d.rate, 0) / data.length).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            School Completion Rates by State
          </h3>
          <p className="text-sm text-gray-600">
            Average completion rate across primary, lower secondary, and upper secondary levels (2022)
          </p>
        </div>
        <button
          onClick={toggleSort}
          className="px-4 py-2 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition text-sm font-medium"
        >
          Sort {sortOrder === 'desc' ? '↓' : '↑'}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={600}>
        <BarChart
          data={sortedData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            type="number"
            domain={[90, 105]}
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            label={{
              value: 'Completion Rate (%)',
              position: 'bottom',
              style: { fill: '#6b7280', fontSize: 12 }
            }}
          />
          <YAxis
            type="category"
            dataKey="state"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            width={90}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="rate" radius={[0, 4, 4, 0]}>
            {sortedData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.rate)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-green-50 rounded">
          <p className="text-gray-600">Highest Rate</p>
          <p className="text-lg font-bold text-green-600">
            {sortedData[0]?.state}: {sortedData[0]?.rate}%
          </p>
        </div>
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-gray-600">National Average</p>
          <p className="text-lg font-bold text-blue-600">
            {avgRate}%
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-gray-600">States Above 100%</p>
          <p className="text-lg font-bold text-gray-900">
            {sortedData.filter(d => d.rate >= 100).length} states
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4">
        Note: Rates above 100% may occur due to age-grade progression differences and inter-state enrollment.
      </p>
    </div>
  );
}
