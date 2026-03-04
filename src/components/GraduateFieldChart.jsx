/**
 * GraduateFieldChart - Horizontal bar chart showing unemployment by field of study
 * Color-coded by performance: green (<7%), amber (7-10%), red (>10%)
 */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import graduateData from '../data/GRADUATES_STATISTICS/graduate-tracer-processed.json';

export default function GraduateFieldChart() {
  const [selectedYear, setSelectedYear] = useState(2024);

  const years = [2020, 2021, 2022, 2023, 2024];

  // Prepare chart data for selected year
  const chartData = graduateData.byField
    .map(field => ({
      field: field.field.replace(' / ', '/').replace('Social Sciences / Journalism & Info', 'Social Sci/Journalism'),
      unemploymentPct: field.unemploymentByYear[selectedYear]?.pct,
      total: field.unemploymentByYear[selectedYear]?.total,
      hasAsterisk: field.unemploymentByYear[selectedYear]?.hasAsterisk,
      methodologyChange: field.unemploymentByYear[selectedYear]?.methodologyChange
    }))
    .filter(d => d.unemploymentPct !== null)
    .sort((a, b) => a.unemploymentPct - b.unemploymentPct);

  // Color function: green (<7%), amber (7-10%), red (>10%)
  const getColor = (value) => {
    if (value < 7) return '#10b981'; // green
    if (value < 10) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  // Find best and worst performers
  const bestField = chartData[0];
  const worstField = chartData[chartData.length - 1];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.field}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Unemployment Rate:</span>
            <span className="font-bold">{data.unemploymentPct?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total Graduates:</span>
            <span className="font-bold">{data.total?.toLocaleString()}</span>
          </div>
          {data.hasAsterisk && (
            <p className="text-xs text-amber-600 mt-2">* Grouped with other fields in {selectedYear}</p>
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
              Graduate Unemployment by Field of Study
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Engineering consistently outperforms, while Education and Services show higher unemployment rates.
              {selectedYear === 2024 && ' Note: 2024 uses different methodology (binary classification).'}
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
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
            <p className="text-xs text-green-600 mb-1">Best Performing</p>
            <p className="text-lg md:text-xl font-bold text-green-700">{bestField?.unemploymentPct?.toFixed(1)}%</p>
            <p className="text-xs text-green-600">{bestField?.field}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200">
            <p className="text-xs text-red-600 mb-1">Highest Unemployment</p>
            <p className="text-lg md:text-xl font-bold text-red-700">{worstField?.unemploymentPct?.toFixed(1)}%</p>
            <p className="text-xs text-red-600">{worstField?.field}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400} className="md:!h-[450px]">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            domain={[0, 'dataMax + 2']}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Unemployment Rate (%)',
              position: 'bottom',
              offset: 0,
              style: { fill: '#6b7280', fontSize: 11 }
            }}
          />
          <YAxis
            type="category"
            dataKey="field"
            width={150}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <ReferenceLine x={7} stroke="#10b981" strokeDasharray="3 3" />
          <ReferenceLine x={10} stroke="#f59e0b" strokeDasharray="3 3" />
          <Bar dataKey="unemploymentPct" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.unemploymentPct)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Color Legend */}
      <div className="mt-4 flex items-center justify-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded" />
          <span className="text-xs text-gray-700">Excellent (&lt;7%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded" />
          <span className="text-xs text-gray-700">Moderate (7-10%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded" />
          <span className="text-xs text-gray-700">High (&gt;10%)</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Graduate Tracer Study {selectedYear} | Department of Higher Education (JPT)
      </div>
    </div>
  );
}
