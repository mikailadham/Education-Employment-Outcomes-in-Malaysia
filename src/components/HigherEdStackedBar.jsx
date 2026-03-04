/**
 * HigherEdStackedBar - Stacked bar chart showing graduate output trends by state (2020-2024)
 * Shows male vs female graduate distribution over time
 */

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import graduateTrends from '../data/graduates/graduate-trends-by-state.json';

export default function HigherEdStackedBar() {
  // Transform data - aggregate totals by year across all states
  const aggregateByYear = () => {
    const yearData = {};

    Object.entries(graduateTrends).forEach(([state, years]) => {
      Object.entries(years).forEach(([year, data]) => {
        if (!yearData[year]) {
          yearData[year] = {
            year: parseInt(year),
            maleGraduates: 0,
            femaleGraduates: 0,
            totalGraduates: 0
          };
        }
        if (data.maleGraduates) yearData[year].maleGraduates += data.maleGraduates;
        if (data.femaleGraduates) yearData[year].femaleGraduates += data.femaleGraduates;
        if (data.totalGraduates) yearData[year].totalGraduates += data.totalGraduates;
      });
    });

    return Object.values(yearData).sort((a, b) => a.year - b.year);
  };

  const chartData = aggregateByYear();

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const total = payload.reduce((sum, entry) => sum + entry.value, 0);
    const malePercent = ((payload[0]?.value / total) * 100).toFixed(1);
    const femalePercent = ((payload[1]?.value / total) * 100).toFixed(1);

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-blue-600 font-medium">Male Graduates:</span>
            <span className="font-bold">{payload[0]?.value.toLocaleString()} ({malePercent}%)</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-pink-600 font-medium">Female Graduates:</span>
            <span className="font-bold">{payload[1]?.value.toLocaleString()} ({femalePercent}%)</span>
          </div>
          <div className="flex justify-between gap-4 border-t pt-1 mt-1">
            <span className="text-gray-600 font-medium">Total:</span>
            <span className="font-bold">{total.toLocaleString()}</span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate statistics
  const latestYear = chartData[chartData.length - 1];
  const earliestYear = chartData[0];
  const totalGrowth = latestYear.totalGraduates - earliestYear.totalGraduates;
  const growthPercent = ((totalGrowth / earliestYear.totalGraduates) * 100).toFixed(1);
  const avgMalePercent = ((latestYear.maleGraduates / latestYear.totalGraduates) * 100).toFixed(1);
  const avgFemalePercent = ((latestYear.femaleGraduates / latestYear.totalGraduates) * 100).toFixed(1);

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Higher Education Graduate Output (2020-2024)
        </h3>
        <p className="text-sm text-gray-600">
          National aggregate of graduate output by gender across all states. Shows steady growth in tertiary education completion.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={chartData}
          margin={{ top: 20, right: 30, left: 60, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="year"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Number of Graduates',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }
            }}
            tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="square"
            formatter={(value) => <span className="text-sm font-medium">{value}</span>}
          />
          <Bar
            dataKey="maleGraduates"
            stackId="graduates"
            fill="#3b82f6"
            name="Male Graduates"
            radius={[0, 0, 0, 0]}
          />
          <Bar
            dataKey="femaleGraduates"
            stackId="graduates"
            fill="#ec4899"
            name="Female Graduates"
            radius={[8, 8, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1">Total Growth (2020-2024)</p>
          <p className="text-2xl font-bold text-blue-700">+{growthPercent}%</p>
          <p className="text-xs text-blue-600 mt-1">{totalGrowth.toLocaleString()} more graduates</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1">Latest Year Output</p>
          <p className="text-2xl font-bold text-green-700">{(latestYear.totalGraduates / 1000000).toFixed(2)}M</p>
          <p className="text-xs text-green-600 mt-1">graduates in {latestYear.year}</p>
        </div>
        <div className="bg-pink-50 rounded-lg p-4">
          <p className="text-xs text-pink-600 mb-1">Female Representation</p>
          <p className="text-2xl font-bold text-pink-700">{avgFemalePercent}%</p>
          <p className="text-xs text-pink-600 mt-1">of total graduates (2024)</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-purple-600 mb-1">Male Representation</p>
          <p className="text-2xl font-bold text-purple-700">{avgMalePercent}%</p>
          <p className="text-xs text-purple-600 mt-1">of total graduates (2024)</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Ministry of Higher Education Malaysia, aggregated state-level data
      </div>
    </div>
  );
}
