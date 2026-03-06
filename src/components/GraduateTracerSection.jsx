import { useState, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import graduateData from '../data/GRADUATES_STATISTICS/graduate-tracer-processed.json';

export default function GraduateTracerSection() {
  const [selectedYear, setSelectedYear] = useState(2024);
  const [viewBy, setViewBy] = useState('Field of Study'); // 'Field of Study', 'State', 'Institution Type'

  const years = [2020, 2021, 2022, 2023, 2024];
  const viewOptions = ['Field of Study', 'State', 'Institution Type'];

  // Get data for selected year
  const yearData = useMemo(() => {
    const nationalData = graduateData.nationalTotals.find(d => d.year === selectedYear);
    const gapData = graduateData.publicPrivateGap.find(d => d.year === selectedYear);

    return {
      national: nationalData,
      gap: gapData
    };
  }, [selectedYear]);

  // Prepare chart data based on view type
  const chartData = useMemo(() => {
    if (viewBy === 'Field of Study') {
      return graduateData.byField
        .map(field => ({
          name: field.field,
          value: field.unemploymentByYear[selectedYear]?.pct || 0,
          total: field.unemploymentByYear[selectedYear]?.total || 0
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);
    } else if (viewBy === 'State') {
      return graduateData.byState
        .map(state => ({
          name: state.state,
          value: state.unemploymentByYear[selectedYear]?.pct || 0,
          total: state.unemploymentByYear[selectedYear]?.total || 0
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);
    } else {
      return graduateData.byInstitution
        .map(inst => ({
          name: inst.type.replace(' (UA)', '').replace(' (IPTS)', ''),
          value: inst.unemploymentByYear[selectedYear]?.pct || 0,
          total: inst.unemploymentByYear[selectedYear]?.total || 0
        }))
        .filter(d => d.value > 0)
        .sort((a, b) => b.value - a.value);
    }
  }, [selectedYear, viewBy]);

  // Get best and worst performers
  const { best, worst } = useMemo(() => {
    if (chartData.length === 0) return { best: null, worst: null };
    return {
      worst: chartData[0],
      best: chartData[chartData.length - 1]
    };
  }, [chartData]);

  // Get KPI data
  const kpiData = useMemo(() => {
    const fieldData = graduateData.byField.map(f => ({
      name: f.field,
      value: f.unemploymentByYear[selectedYear]?.pct || 0
    })).filter(d => d.value > 0).sort((a, b) => a.value - b.value);

    const stateData = graduateData.byState.map(s => ({
      name: s.state,
      value: s.unemploymentByYear[selectedYear]?.pct || 0
    })).filter(d => d.value > 0).sort((a, b) => a.value - b.value);

    const publicData = graduateData.byInstitution.find(i => i.type.includes('Public'));
    const privateData = graduateData.byInstitution.find(i => i.type.includes('Private'));

    return {
      nationalRate: yearData.national?.unemployed.pct || 0,
      publicRate: publicData?.unemploymentByYear[selectedYear]?.pct || 0,
      privateRate: privateData?.unemploymentByYear[selectedYear]?.pct || 0,
      gap: yearData.gap?.multiplier || '0x',
      bestField: fieldData[0] || { name: 'N/A', value: 0 },
      worstField: fieldData[fieldData.length - 1] || { name: 'N/A', value: 0 },
      bestState: stateData[0] || { name: 'N/A', value: 0 },
      worstState: stateData[stateData.length - 1] || { name: 'N/A', value: 0 }
    };
  }, [selectedYear, yearData]);

  // Color functions
  const getBarColor = (value, name) => {
    if (viewBy === 'Field of Study') {
      if (value < 7) return '#10b981'; // green
      if (value <= 10) return '#f59e0b'; // amber
      return '#ef4444'; // red
    } else if (viewBy === 'State') {
      // Dynamically determine bottom 3 and top performer based on current data
      const sortedByValue = [...chartData].sort((a, b) => b.value - a.value);
      const bottom3Names = sortedByValue.slice(0, 3).map(d => d.name);
      const topPerformerName = sortedByValue[sortedByValue.length - 1]?.name;

      if (bottom3Names.includes(name)) return '#ef4444'; // red for bottom 3
      if (name === topPerformerName) return '#10b981'; // green for best
      return '#6b7280'; // gray for others
    } else {
      if (value < 7) return '#10b981';
      if (value <= 10) return '#f59e0b';
      return '#ef4444';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {/* LEFT PANEL - Selector */}
      <div className="lg:col-span-1">
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span>🎓</span>
            <span>Graduate Tracer Study</span>
          </h3>

          {/* YEAR Selector */}
          <div className="mb-6">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              YEAR
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {years.map((year) => (
                <button
                  key={year}
                  onClick={() => setSelectedYear(year)}
                  className={`
                    text-center px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${selectedYear === year
                      ? 'bg-teal-500 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 hover:border-teal-300'
                    }
                  `}
                >
                  {year}
                  {selectedYear === year && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* VIEW BY Selector */}
          <div className="mb-6">
            <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
              VIEW BY
            </h4>
            <div className="space-y-2">
              {viewOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setViewBy(option)}
                  className={`
                    w-full text-left px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${viewBy === option
                      ? 'bg-teal-500 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 hover:border-teal-300'
                    }
                  `}
                >
                  {option}
                  {viewBy === option && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Methodology Note */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center">
              ⚠️ 2024 uses revised methodology — not directly comparable to prior years
            </p>
          </div>
        </div>
      </div>

      {/* CENTER PANEL - Main Chart */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedYear} — Graduate Unemployment by {viewBy}
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Percentage of graduates not working, sorted from highest to lowest
          </p>

          <ResponsiveContainer width="100%" height={Math.max(400, chartData.length * 35)}>
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis type="number" domain={[0, 'auto']} />
              <YAxis dataKey="name" type="category" width={140} style={{ fontSize: '11px' }} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
                        <p className="font-semibold text-gray-900">{payload[0].payload.name}</p>
                        <p className="text-sm text-gray-700">
                          Unemployment: <span className="font-bold">{payload[0].value.toFixed(1)}%</span>
                        </p>
                        <p className="text-xs text-gray-500">
                          Total tracked: {payload[0].payload.total.toLocaleString()}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.value, entry.name)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>

          {/* Summary Stats Strip */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">National Rate</p>
              <p className="text-2xl font-bold text-gray-900">{yearData.national?.unemployed.pct.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Best Performer</p>
              <p className="text-lg font-bold text-green-600">{best?.name}</p>
              <p className="text-sm text-gray-700">{best?.value.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 mb-1">Worst Performer</p>
              <p className="text-lg font-bold text-red-600">{worst?.name}</p>
              <p className="text-sm text-gray-700">{worst?.value.toFixed(1)}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL - KPI Cards */}
      <div className="lg:col-span-1">
        <div className="space-y-3">
          {/* Section Header */}
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2 mb-2">
            <span>🎓</span>
            <span>Graduate Employment</span>
          </h3>

          {/* National Unemployment Rate */}
          <div className={`rounded-lg p-3 ${kpiData.nationalRate > 10 ? 'bg-red-50 border-l-4 border-red-500' : 'bg-white border border-gray-200'}`}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">National Unemployment</p>
              <span className="text-sm">📊</span>
            </div>
            <p className={`text-2xl font-bold ${kpiData.nationalRate > 10 ? 'text-red-700' : 'text-gray-900'}`}>
              {kpiData.nationalRate.toFixed(1)}%
            </p>
          </div>

          {/* Public University Rate */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">Public University</p>
              <span className="text-sm">🏛️</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{kpiData.publicRate.toFixed(1)}%</p>
          </div>

          {/* Private HEI Rate */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">Private HEI</p>
              <span className="text-sm">🏢</span>
            </div>
            <p className="text-2xl font-bold text-red-700">{kpiData.privateRate.toFixed(1)}%</p>
          </div>

          {/* Public vs Private Gap */}
          <div className="bg-white border border-gray-200 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">Public vs Private Gap</p>
              <span className="text-sm">⚖️</span>
            </div>
            <p className="text-2xl font-bold text-purple-700">{kpiData.gap}</p>
            <p className="text-xs text-gray-500">multiplier</p>
          </div>

          {/* Best State */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">Best State</p>
              <span className="text-sm">🏆</span>
            </div>
            <p className="text-sm font-bold text-green-700">{kpiData.bestState.name}</p>
            <p className="text-xl font-bold text-green-700">{kpiData.bestState.value.toFixed(1)}%</p>
          </div>

          {/* Worst State */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">Worst State</p>
              <span className="text-sm">⚠️</span>
            </div>
            <p className="text-sm font-bold text-red-700">{kpiData.worstState.name}</p>
            <p className="text-xl font-bold text-red-700">{kpiData.worstState.value.toFixed(1)}%</p>
          </div>

          {/* Best Field */}
          <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">Best Field</p>
              <span className="text-sm">✅</span>
            </div>
            <p className="text-xs font-bold text-green-700 leading-tight">{kpiData.bestField.name}</p>
            <p className="text-xl font-bold text-green-700">{kpiData.bestField.value.toFixed(1)}%</p>
          </div>

          {/* Worst Field */}
          <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-3">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs font-medium text-gray-600">Worst Field</p>
              <span className="text-sm">❌</span>
            </div>
            <p className="text-xs font-bold text-red-700 leading-tight">{kpiData.worstField.name}</p>
            <p className="text-xl font-bold text-red-700">{kpiData.worstField.value.toFixed(1)}%</p>
          </div>
        </div>
      </div>
    </div>
  );
}
