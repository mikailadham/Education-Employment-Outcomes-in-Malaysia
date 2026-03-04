/**
 * LFPRRankedBar - Ranked horizontal bar chart showing Labour Force Participation Rate by state
 * Auto-sorted in descending order to show highest to lowest participation rates
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import summaryData from '../data/summary-by-state.json';

export default function LFPRRankedBar() {
  // Transform and sort data by participation rate (descending)
  const chartData = Object.entries(summaryData)
    .map(([stateName, state]) => ({
      state: stateName.replace('W.P. ', ''),
      lfpr: state.participation_rate,
      employed: state.employed,
      unemployed: state.unemployed,
      labourForce: state.labour_force
    }))
    .filter(d => d.lfpr !== null && d.lfpr !== undefined)
    .sort((a, b) => b.lfpr - a.lfpr);

  // Color scale based on LFPR value
  const getBarColor = (value) => {
    if (value >= 75) return '#10b981'; // Green for high LFPR
    if (value >= 70) return '#3b82f6'; // Blue for good LFPR
    if (value >= 65) return '#f59e0b'; // Orange for moderate LFPR
    return '#ef4444'; // Red for low LFPR
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.state}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">LFPR:</span>
            <span className="font-bold">{data.lfpr.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Labour Force:</span>
            <span className="font-bold">{data.labourForce.toFixed(1)}k</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Employed:</span>
            <span className="font-bold">{data.employed.toFixed(1)}k</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Unemployed:</span>
            <span className="font-bold">{data.unemployed.toFixed(1)}k</span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate statistics
  const avgLFPR = (chartData.reduce((sum, d) => sum + d.lfpr, 0) / chartData.length).toFixed(1);
  const highestState = chartData[0];
  const lowestState = chartData[chartData.length - 1];
  const range = (highestState.lfpr - lowestState.lfpr).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Labour Force Participation Rate by State (2023)
        </h3>
        <p className="text-sm text-gray-600">
          States ranked by LFPR (highest to lowest). Colors indicate performance tiers: green (75%+), blue (70-75%), orange (65-70%), red (below 65%).
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Labour Force Participation Rate (%)',
              position: 'bottom',
              offset: -5,
              style: { fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }
            }}
            domain={[0, 85]}
          />
          <YAxis
            type="category"
            dataKey="state"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            width={110}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="lfpr" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getBarColor(entry.lfpr)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1">Highest LFPR</p>
          <p className="text-2xl font-bold text-green-700">{highestState.lfpr.toFixed(1)}%</p>
          <p className="text-xs text-green-600 mt-1">{highestState.state}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1">National Average</p>
          <p className="text-2xl font-bold text-blue-700">{avgLFPR}%</p>
          <p className="text-xs text-blue-600 mt-1">across all states</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4">
          <p className="text-xs text-red-600 mb-1">Lowest LFPR</p>
          <p className="text-2xl font-bold text-red-700">{lowestState.lfpr.toFixed(1)}%</p>
          <p className="text-xs text-red-600 mt-1">{lowestState.state}</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs text-orange-600 mb-1">State Range</p>
          <p className="text-2xl font-bold text-orange-700">{range}pp</p>
          <p className="text-xs text-orange-600 mt-1">percentage points spread</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Department of Statistics Malaysia, Labour Force Survey 2023
      </div>
    </div>
  );
}
