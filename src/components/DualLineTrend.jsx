/**
 * DualLineTrend - Youth vs Overall Unemployment Trend (2016-2025)
 * Compares youth (15-24) unemployment rate against overall unemployment rate
 */

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
import unemploymentTrend from '../data/labour/unemployment-trend.json';

export default function DualLineTrend() {
  const data = unemploymentTrend.annual;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded shadow-lg">
          <p className="font-semibold text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">
            Youth (15-24): {payload[0].value}%
          </p>
          <p className="text-sm text-purple-600">
            Overall: {payload[1].value}%
          </p>
          <p className="text-sm text-gray-600 mt-1">
            Gap: {(payload[0].value - payload[1].value).toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold text-gray-900 mb-2">
        Youth vs Overall Unemployment Trends
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Comparison of unemployment rates (2016-2025). Youth unemployment consistently runs 7-9% higher than overall rate.
      </p>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="year"
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            stroke="#6b7280"
            tick={{ fill: '#6b7280', fontSize: 12 }}
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
          <Line
            type="monotone"
            dataKey="youth_unemployment_rate"
            name="Youth (15-24)"
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ fill: '#3b82f6', r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="overall_unemployment_rate"
            name="Overall"
            stroke="#8b5cf6"
            strokeWidth={2}
            dot={{ fill: '#8b5cf6', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="p-3 bg-blue-50 rounded">
          <p className="text-gray-600">Latest Youth Rate (2025)</p>
          <p className="text-2xl font-bold text-blue-600">
            {data[data.length - 1].youth_unemployment_rate}%
          </p>
        </div>
        <div className="p-3 bg-purple-50 rounded">
          <p className="text-gray-600">Latest Overall Rate (2025)</p>
          <p className="text-2xl font-bold text-purple-600">
            {data[data.length - 1].overall_unemployment_rate}%
          </p>
        </div>
        <div className="p-3 bg-gray-50 rounded">
          <p className="text-gray-600">Current Gap</p>
          <p className="text-2xl font-bold text-gray-900">
            {(data[data.length - 1].youth_unemployment_rate - data[data.length - 1].overall_unemployment_rate).toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
