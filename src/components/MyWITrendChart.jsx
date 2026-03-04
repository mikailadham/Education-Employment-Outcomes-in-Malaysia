/**
 * MyWITrendChart - Interactive line chart showing state's well-being trajectory
 * Displays MyWI Overall, Economic, Social, and Environmental sub-composites over time
 */

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';
import mywiByState from '../data/wellbeing/mywi-by-state.json';

export default function MyWITrendChart() {
  const [stateName, setStateName] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [activeLines, setActiveLines] = useState({
    overall: true,
    economic: true,
    social: true,
    environmental: true
  });

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

    // Handle Wilayah Persekutuan mapping - MyWI data uses "Wilayah Persekutuan" for all 3 FTs
    let lookupName = stateName;
    if (stateName === 'W.P. Kuala Lumpur' || stateName === 'W.P. Putrajaya' || stateName === 'W.P. Labuan') {
      lookupName = 'Wilayah Persekutuan';
    }

    if (!mywiByState[lookupName]) {
      setChartData([]);
      return;
    }

    const stateData = mywiByState[lookupName];
    const years = Object.keys(stateData).sort();

    const data = years.map(year => ({
      year: parseInt(year),
      overall: stateData[year].overall,
      economic: stateData[year].economic,
      social: stateData[year].social,
      environmental: stateData[year].environmental
    }));

    setChartData(data);
  }, [stateName]);

  if (!chartData.length) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        <p>No MyWI data available for this state</p>
      </div>
    );
  }

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 text-sm">
            <span style={{ color: entry.color }} className="font-medium">
              {entry.name}:
            </span>
            <span className="font-bold">{entry.value.toFixed(1)}</span>
          </div>
        ))}
        <p className="text-xs text-gray-500 mt-2 border-t pt-1">
          Base year 2010 = 100
        </p>
      </div>
    );
  };

  // Custom legend with toggle functionality
  const CustomLegend = ({ payload }) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {payload.map((entry, index) => {
          const key = entry.dataKey;
          const isActive = activeLines[key];

          return (
            <button
              key={index}
              onClick={() => setActiveLines(prev => ({ ...prev, [key]: !prev[key] }))}
              className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium transition-all ${
                isActive
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-gray-50 text-gray-400 opacity-50'
              }`}
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: isActive ? entry.color : '#d1d5db' }}
              />
              <span>{entry.value}</span>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {stateName} — Well-Being Trajectory (2010-2024)
        </h3>
        <p className="text-sm text-gray-600">
          MyWI tracks quality of life improvements across economic, social, and environmental dimensions.
          Click legend items to show/hide series.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
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
            label={{ value: 'Index Value', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 12 } }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />

          {/* Base year reference line */}
          <ReferenceLine
            y={100}
            stroke="#9ca3af"
            strokeDasharray="5 5"
            label={{ value: 'Base (2010)', position: 'right', fill: '#9ca3af', fontSize: 11 }}
          />

          {/* Lines */}
          {activeLines.overall && (
            <Line
              type="monotone"
              dataKey="overall"
              name="Overall"
              stroke="#14b8a6"
              strokeWidth={3}
              dot={{ fill: '#14b8a6', r: 4 }}
              activeDot={{ r: 6, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1000}
            />
          )}
          {activeLines.economic && (
            <Line
              type="monotone"
              dataKey="economic"
              name="Economic"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1000}
            />
          )}
          {activeLines.social && (
            <Line
              type="monotone"
              dataKey="social"
              name="Social"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1000}
            />
          )}
          {activeLines.environmental && (
            <Line
              type="monotone"
              dataKey="environmental"
              name="Environmental"
              stroke="#84cc16"
              strokeWidth={2}
              dot={{ fill: '#84cc16', r: 3 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: '#fff' }}
              animationDuration={1000}
            />
          )}
        </LineChart>
      </ResponsiveContainer>

      {/* Key insights */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { key: 'overall', label: 'Overall', color: 'teal' },
          { key: 'economic', label: 'Economic', color: 'blue' },
          { key: 'social', label: 'Social', color: 'green' },
          { key: 'environmental', label: 'Environmental', color: 'lime' }
        ].map(({ key, label, color }) => {
          const latest = chartData[chartData.length - 1]?.[key];
          const earliest = chartData[0]?.[key];
          const change = latest - earliest;
          const changePercent = ((change / earliest) * 100).toFixed(1);

          return (
            <div key={key} className="bg-gray-50 rounded-lg p-4">
              <p className="text-xs text-gray-600 mb-1">{label} (2010-2024)</p>
              <p className={`text-2xl font-bold text-${color}-600`}>
                {change > 0 ? '+' : ''}{change.toFixed(1)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {changePercent > 0 ? '+' : ''}{changePercent}% change
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
