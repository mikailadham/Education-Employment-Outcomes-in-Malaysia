/**
 * GraduateInstitutionChart - Grouped bar chart comparing unemployment across institution types
 * Includes Public Universities, Private HEIs, Polytechnics, Community Colleges, Vocational Colleges
 */

import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Cell } from 'recharts';
import graduateData from '../data/GRADUATES_STATISTICS/graduate-tracer-processed.json';

export default function GraduateInstitutionChart() {
  const [selectedYear, setSelectedYear] = useState(2024);

  const years = [2020, 2021, 2022, 2023, 2024];

  // Focus on main institution types
  const mainInstitutions = [
    'Public Universities (UA)',
    'Private HEIs (IPTS)',
    'Polytechnics',
    'Community Colleges',
    'Vocational Colleges'
  ];

  // Shorten institution names for better readability
  const shortenName = (name) => {
    return name
      .replace('Public Universities (UA)', 'Public Unis')
      .replace('Private HEIs (IPTS)', 'Private HEIs')
      .replace('Polytechnics', 'Polytechnics')
      .replace('Community Colleges', 'Comm. Colleges')
      .replace('Vocational Colleges', 'Vocational');
  };

  // Prepare chart data for selected year
  const chartData = graduateData.byInstitution
    .filter(inst => mainInstitutions.includes(inst.type))
    .map(inst => ({
      type: shortenName(inst.type),
      fullType: inst.type,
      unemploymentPct: inst.unemploymentByYear[selectedYear]?.pct,
      total: inst.unemploymentByYear[selectedYear]?.total,
      methodologyChange: inst.unemploymentByYear[selectedYear]?.methodologyChange
    }))
    .sort((a, b) => a.unemploymentPct - b.unemploymentPct);

  // Color palette for institutions (using shortened names)
  const institutionColors = {
    'Public Unis': '#3b82f6', // blue
    'Private HEIs': '#f97316', // orange
    'Polytechnics': '#10b981', // green
    'Comm. Colleges': '#8b5cf6', // purple
    'Vocational': '#ef4444' // red
  };

  const getColor = (type) => institutionColors[type] || '#6b7280';

  // Find best and worst performers
  const bestInst = chartData[0];
  const worstInst = chartData[chartData.length - 1];

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.fullType || data.type}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Unemployment Rate:</span>
            <span className="font-bold">{data.unemploymentPct?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Total Graduates:</span>
            <span className="font-bold">{data.total?.toLocaleString()}</span>
          </div>
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
              Graduate Unemployment by Institution Type
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Public universities and polytechnics show significantly better employment outcomes than private institutions.
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
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-green-50 rounded-lg p-3 border-2 border-green-200">
            <p className="text-xs text-green-600 mb-1">Best Performing</p>
            <p className="text-lg md:text-xl font-bold text-green-700">{bestInst?.unemploymentPct?.toFixed(1)}%</p>
            <p className="text-xs text-green-600">{bestInst?.type}</p>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border-2 border-red-200">
            <p className="text-xs text-red-600 mb-1">Highest Unemployment</p>
            <p className="text-lg md:text-xl font-bold text-red-700">{worstInst?.unemploymentPct?.toFixed(1)}%</p>
            <p className="text-xs text-red-600">{worstInst?.type}</p>
          </div>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={400} className="md:!h-[450px]">
        <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 100 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            dataKey="type"
            angle={-45}
            textAnchor="end"
            height={100}
            interval={0}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />

          <YAxis
            domain={[0, 'dataMax + 2']}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Unemployment Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 11 }
            }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />

          <Bar dataKey="unemploymentPct" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.type)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Comparison Table - All Years */}
      <div className="mt-6">
        <h4 className="text-sm font-bold text-gray-900 mb-3">5-Year Trend Comparison</h4>
        <div className="overflow-x-auto -mx-4 md:mx-0">
          <table className="w-full text-xs md:text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-700 sticky left-0 bg-gray-50">Institution</th>
                {years.map(year => (
                  <th
                    key={year}
                    className={`px-2 md:px-4 py-2 text-center font-medium ${year === selectedYear ? 'bg-teal-100 text-teal-700' : 'text-gray-700'}`}
                  >
                    {year}
                    {year === 2024 && <span className="ml-1 text-purple-600">⚠</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {graduateData.byInstitution
                .filter(inst => mainInstitutions.includes(inst.type))
                .map(inst => {
                  const shortName = shortenName(inst.type);
                  return (
                    <tr key={inst.type} className="hover:bg-gray-50">
                      <td className="px-2 md:px-4 py-2 font-medium text-gray-900 sticky left-0 bg-white text-xs">
                        {shortName}
                      </td>
                      {years.map(year => (
                        <td
                          key={year}
                          className={`px-2 md:px-4 py-2 text-center font-bold ${
                            year === selectedYear ? 'bg-teal-50' : ''
                          }`}
                          style={{ color: getColor(shortName) }}
                        >
                          {inst.unemploymentByYear[year]?.pct?.toFixed(1)}%
                        </td>
                      ))}
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Key Insights */}
      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-900">
          <strong>Policy Insight:</strong> Public universities consistently produce graduates with better employment outcomes than private HEIs.
          Polytechnics and community colleges show excellent performance with under 2% unemployment in 2024, suggesting strong industry alignment.
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Graduate Tracer Study {selectedYear} | Department of Higher Education (JPT)
      </div>
    </div>
  );
}
