/**
 * GraduateStateRanking - Ranked horizontal bar chart of states by graduate unemployment
 * Bottom 3 (Sabah, Kelantan, Sarawak) highlighted in red, top performer (Putrajaya) in green
 */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import graduateData from '../data/GRADUATES_STATISTICS/graduate-tracer-processed.json';

export default function GraduateStateRanking() {
  const [selectedYear, setSelectedYear] = useState(2024);

  const years = [2020, 2021, 2022, 2023, 2024];

  // Prepare chart data for selected year
  const chartData = graduateData.byState
    .map(state => ({
      state: state.state,
      unemploymentPct: state.unemploymentByYear[selectedYear]?.pct,
      total: state.unemploymentByYear[selectedYear]?.total,
      rank: state.rank2024,
      methodologyChange: state.unemploymentByYear[selectedYear]?.methodologyChange
    }))
    .filter(d => d.unemploymentPct !== null)
    .sort((a, b) => b.unemploymentPct - a.unemploymentPct); // Descending order

  // Dynamically determine bottom 3 and top performer based on current year's data
  const bottomThree = chartData.slice(0, 3).map(d => d.state);
  const topPerformer = chartData[chartData.length - 1]?.state;

  // Get color based on state
  const getColor = (state) => {
    if (state === topPerformer) return '#10b981'; // green
    if (bottomThree.includes(state)) return '#ef4444'; // red
    return '#6b7280'; // gray
  };

  // Calculate statistics
  const nationalAvg = chartData.reduce((sum, d) => sum + d.unemploymentPct, 0) / chartData.length;
  const worst = chartData[0];
  const best = chartData[chartData.length - 1];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isBottom = bottomThree.includes(data.state);
    const isTop = data.state === topPerformer;

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.state}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Unemployment Rate:</span>
            <span className="font-bold">{data.unemploymentPct?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total Graduates:</span>
            <span className="font-bold">{data.total?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">vs National Avg:</span>
            <span className="font-bold">{(data.unemploymentPct - nationalAvg > 0 ? '+' : '')}{(data.unemploymentPct - nationalAvg).toFixed(1)}pp</span>
          </div>
          {isBottom && (
            <p className="text-xs text-red-600 mt-2 font-bold">⚠ Consistently underperforming state</p>
          )}
          {isTop && (
            <p className="text-xs text-green-600 mt-2 font-bold">✓ Top performing state</p>
          )}
          {data.methodologyChange && (
            <p className="text-xs text-purple-600 mt-2">⚠ 2024 methodology change</p>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl">
      <div className="mb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              Graduate Unemployment by State Ranking
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              {bottomThree.join(', ')} show highest graduate unemployment in {selectedYear}.
              {selectedYear === 2024 && ' Note: 2024 uses different methodology.'}
            </p>
          </div>

          {/* Year Selector */}
          <div className="flex gap-2 flex-wrap">
            {years.map(year => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  selectedYear === year
                    ? 'bg-teal-600 text-white shadow-md'
                    : 'bg-gray-100 text-gray-700 active:bg-gray-300'
                }`}
              >
                {year}
                {year === 2024 && <span className="ml-1 text-xs">⚠</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Performance Summary */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200">
            <p className="text-xs text-red-600 mb-1">Worst</p>
            <p className="text-lg md:text-xl font-bold text-red-700">{worst?.unemploymentPct?.toFixed(1)}%</p>
            <p className="text-xs text-red-600">{worst?.state}</p>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border-2 border-blue-200">
            <p className="text-xs text-blue-600 mb-1">National Avg</p>
            <p className="text-lg md:text-xl font-bold text-blue-700">{nationalAvg?.toFixed(1)}%</p>
            <p className="text-xs text-blue-600">All states</p>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
            <p className="text-xs text-green-600 mb-1">Best</p>
            <p className="text-lg md:text-xl font-bold text-green-700">{best?.unemploymentPct?.toFixed(1)}%</p>
            <p className="text-xs text-green-600">{best?.state}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={500} className="md:!h-[550px]">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            domain={[0, 'dataMax + 2']}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Graduate Unemployment Rate (%)',
              position: 'bottom',
              offset: 0,
              style: { fill: '#6b7280', fontSize: 11 }
            }}
          />
          <YAxis
            type="category"
            dataKey="state"
            width={120}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Bar dataKey="unemploymentPct" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.state)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-xs text-gray-700">Top Performer ({topPerformer})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-xs text-gray-700">Bottom 3 ({bottomThree.join(', ')})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-500 rounded" />
          <span className="text-xs text-gray-700">Other States</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Graduate Tracer Study {selectedYear} | Department of Higher Education (JPT)
      </div>
    </div>
  );
}
