/**
 * PublicPrivateGapChart - Dual line chart showing public university vs private HEI unemployment gap
 * Shaded area between lines, with KEY INSIGHT badge and 2024 methodology warning
 */

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ReferenceLine } from 'recharts';
import graduateData from '../data/GRADUATES_STATISTICS/graduate-tracer-processed.json';

export default function PublicPrivateGapChart() {
  const chartData = graduateData.publicPrivateGap;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-blue-600">Public Universities:</span>
            <span className="font-bold">{data.publicUniversity?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-orange-600">Private HEIs:</span>
            <span className="font-bold">{data.privateHEI?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4 pt-2 border-t border-gray-200">
            <span className="text-gray-600">Gap:</span>
            <span className="font-bold text-red-600">{data.gap?.toFixed(1)}pp</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Multiplier:</span>
            <span className="font-bold text-purple-600">{data.multiplier}</span>
          </div>
          {data.methodologyChange && (
            <p className="text-xs text-purple-600 mt-2 font-bold">⚠ 2024 methodology change</p>
          )}
        </div>
      </div>
    );
  };

  // Custom dot for 2024 point
  const CustomDot = (props) => {
    const { cx, cy, payload, stroke } = props;
    if (payload.year === 2024) {
      return (
        <>
          <circle cx={cx} cy={cy} r={6} fill="white" stroke={stroke} strokeWidth={3} />
          <text x={cx} y={cy - 15} textAnchor="middle" fill="#9333ea" fontSize={10} fontWeight="bold">
            ⚠ Method change
          </text>
        </>
      );
    }
    return <circle cx={cx} cy={cy} r={4} fill={stroke} />;
  };

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl border-4 border-purple-500">
      <div className="mb-6">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1">
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              Public University vs Private HEI Graduate Unemployment Gap
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Private HEI graduates consistently face higher unemployment rates than public university graduates.
              The gap has widened from 1.55x in 2020 to 2.51x in 2024.
            </p>
          </div>
          <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full whitespace-nowrap">
            KEY INSIGHT
          </span>
        </div>

        {/* Key Finding */}
        <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded mt-4">
          <p className="text-sm md:text-base font-bold text-purple-900">
            📊 Private HEI graduates are <span className="text-purple-700 text-lg">2.5x</span> more likely to be unemployed than public university graduates (2024)
          </p>
          <p className="text-xs text-purple-700 mt-1">
            Gap: 7.7 percentage points | Public: 5.1% | Private: 12.8%
          </p>
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={350} className="md:!h-[400px]">
        <LineChart data={chartData} margin={{ top: 30, right: 30, left: 20, bottom: 20 }}>
          <defs>
            {/* Gradient for gap shading */}
            <linearGradient id="gapGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f97316" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#f97316" stopOpacity={0.1} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            dataKey="year"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Year',
              position: 'bottom',
              offset: 0,
              style: { fill: '#6b7280', fontSize: 11 }
            }}
          />

          <YAxis
            domain={[0, 25]}
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Graduate Unemployment Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 11 }
            }}
          />

          <Tooltip content={<CustomTooltip />} />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="line"
            wrapperStyle={{ fontSize: '12px' }}
          />

          {/* Shaded area for the gap */}
          <Area
            type="monotone"
            dataKey="privateHEI"
            fill="url(#gapGradient)"
            stroke="none"
            activeDot={false}
            legendType="none"
          />

          {/* Reference line for 2024 methodology change */}
          <ReferenceLine
            x={2024}
            stroke="#9333ea"
            strokeDasharray="5 5"
            strokeWidth={2}
            label={{
              value: '2024 Method Change',
              position: 'top',
              fill: '#9333ea',
              fontSize: 10,
              fontWeight: 'bold'
            }}
          />

          {/* Public University Line */}
          <Line
            type="monotone"
            dataKey="publicUniversity"
            name="Public Universities"
            stroke="#3b82f6"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 6 }}
          />

          {/* Private HEI Line */}
          <Line
            type="monotone"
            dataKey="privateHEI"
            name="Private HEIs"
            stroke="#f97316"
            strokeWidth={3}
            dot={<CustomDot />}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Gap Progression Table */}
      <div className="mt-6 overflow-x-auto">
        <table className="w-full text-xs md:text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 md:px-4 py-2 text-left font-medium text-gray-700">Year</th>
              <th className="px-2 md:px-4 py-2 text-center font-medium text-blue-700">Public</th>
              <th className="px-2 md:px-4 py-2 text-center font-medium text-orange-700">Private</th>
              <th className="px-2 md:px-4 py-2 text-center font-medium text-red-700">Gap</th>
              <th className="px-2 md:px-4 py-2 text-center font-medium text-purple-700">Multiplier</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {chartData.map(row => (
              <tr key={row.year} className={`${row.methodologyChange ? 'bg-purple-50' : 'hover:bg-gray-50'}`}>
                <td className="px-2 md:px-4 py-2 font-medium text-gray-900">
                  {row.year}
                  {row.methodologyChange && <span className="ml-1 text-purple-600">⚠</span>}
                </td>
                <td className="px-2 md:px-4 py-2 text-center text-blue-700 font-bold">{row.publicUniversity}%</td>
                <td className="px-2 md:px-4 py-2 text-center text-orange-700 font-bold">{row.privateHEI}%</td>
                <td className="px-2 md:px-4 py-2 text-center text-red-700 font-bold">{row.gap}pp</td>
                <td className="px-2 md:px-4 py-2 text-center text-purple-700 font-bold">{row.multiplier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
        <p className="text-xs text-yellow-800">
          <strong>Methodology Note:</strong> 2024 uses binary GE rate (Employed vs Not Working Yet) instead of 5-category classification used in 2020-2023.
          This may affect direct comparability but the trend remains consistent.
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Graduate Tracer Study 2020-2024 | Department of Higher Education (JPT)
      </div>
    </div>
  );
}
