/**
 * StateComparison - Multi-state comparison tool
 * Allows selecting 2-5 states and comparing their MyWI metrics side-by-side
 */

import { useState, useEffect, useMemo } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts';
import mywiByState from '../data/wellbeing/mywi-by-state.json';
import mywiLatest from '../data/wellbeing/mywi-latest.json';
import summaryData from '../data/summary-by-state.json';
import graduateData from '../data/graduates/graduate-employment-by-state-2024.json';

const STATE_COLORS = {
  0: '#14b8a6', // teal
  1: '#3b82f6', // blue
  2: '#10b981', // green
  3: '#f59e0b', // amber
  4: '#8b5cf6', // purple
  5: '#ef4444', // red
  6: '#06b6d4', // cyan
  7: '#ec4899'  // pink
};

export default function StateComparison() {
  const [isOpen, setIsOpen] = useState(false);
  const [comparisonMode, setComparisonMode] = useState('states'); // 'states' or 'years'
  const [selectedStates, setSelectedStates] = useState([]);
  const [selectedState, setSelectedState] = useState(''); // For year comparison mode
  const [selectedYears, setSelectedYears] = useState([]);
  const [availableStates, setAvailableStates] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  // Merge summary data with graduate data (same as MalaysiaMap)
  const mergedData = useMemo(() => {
    const merged = {};
    Object.keys(summaryData).forEach(state => {
      merged[state] = {
        ...summaryData[state],
        ...graduateData[state]
      };
    });
    return merged;
  }, []);

  useEffect(() => {
    // Get all available states
    const states = Object.keys(mergedData).sort();
    setAvailableStates(states);

    // Get all available years from MyWI data
    const firstState = Object.keys(mywiByState)[0];
    if (firstState) {
      const years = Object.keys(mywiByState[firstState]).sort();
      setAvailableYears(years);
    }
  }, [mergedData]);

  const toggleState = (state) => {
    if (selectedStates.includes(state)) {
      setSelectedStates(selectedStates.filter(s => s !== state));
    } else {
      if (selectedStates.length < 5) {
        setSelectedStates([...selectedStates, state]);
      }
    }
  };

  const clearSelection = () => {
    setSelectedStates([]);
  };

  const toggleYear = (year) => {
    if (selectedYears.includes(year)) {
      setSelectedYears(selectedYears.filter(y => y !== year));
    } else {
      if (selectedYears.length < 5) {
        setSelectedYears([...selectedYears, year]);
      }
    }
  };

  const clearYearSelection = () => {
    setSelectedYears([]);
  };

  const switchMode = (newMode) => {
    setComparisonMode(newMode);
    setSelectedStates([]);
    setSelectedState('');
    setSelectedYears([]);
  };

  // Map WP states to Wilayah Persekutuan for MyWI data lookup
  const getMyWIStateName = (state) => {
    if (state === 'W.P. Kuala Lumpur' || state === 'W.P. Putrajaya' || state === 'W.P. Labuan') {
      return 'Wilayah Persekutuan';
    }
    return state;
  };

  // Prepare trend data for line chart
  const getTrendData = () => {
    if (comparisonMode === 'states') {
      if (selectedStates.length === 0) return [];

      const years = Object.keys(mywiByState[getMyWIStateName(selectedStates[0])] || {}).sort();

      return years.map(year => {
        const dataPoint = { year: parseInt(year) };
        selectedStates.forEach((state, index) => {
          const mywiState = getMyWIStateName(state);
          dataPoint[state] = mywiByState[mywiState]?.[year]?.overall;
        });
        return dataPoint;
      });
    } else {
      // Year comparison mode
      if (!selectedState || selectedYears.length === 0) return [];

      const mywiState = getMyWIStateName(selectedState);
      const allYears = Object.keys(mywiByState[mywiState] || {}).sort();

      return allYears.map(year => {
        const dataPoint = { year: parseInt(year) };
        selectedYears.forEach(selectedYear => {
          if (year === selectedYear) {
            dataPoint[selectedYear] = mywiByState[mywiState]?.[year]?.overall;
          }
        });
        // Show baseline trend for context
        dataPoint['All Years'] = mywiByState[mywiState]?.[year]?.overall;
        return dataPoint;
      });
    }
  };

  // Prepare sub-composite comparison data
  const getSubCompositeData = () => {
    if (comparisonMode === 'states') {
      if (selectedStates.length === 0) return [];

      return [
        {
          metric: 'Economic',
          ...selectedStates.reduce((acc, state, index) => {
            const mywiState = getMyWIStateName(state);
            acc[state] = mywiLatest[mywiState]?.economic;
            return acc;
          }, {})
        },
        {
          metric: 'Social',
          ...selectedStates.reduce((acc, state, index) => {
            const mywiState = getMyWIStateName(state);
            acc[state] = mywiLatest[mywiState]?.social;
            return acc;
          }, {})
        },
        {
          metric: 'Environmental',
          ...selectedStates.reduce((acc, state, index) => {
            const mywiState = getMyWIStateName(state);
            acc[state] = mywiLatest[mywiState]?.environmental;
            return acc;
          }, {})
        }
      ];
    } else {
      // Year comparison mode
      if (!selectedState || selectedYears.length === 0) return [];

      const mywiState = getMyWIStateName(selectedState);

      return [
        {
          metric: 'Economic',
          ...selectedYears.reduce((acc, year) => {
            acc[year] = mywiByState[mywiState]?.[year]?.economic;
            return acc;
          }, {})
        },
        {
          metric: 'Social',
          ...selectedYears.reduce((acc, year) => {
            acc[year] = mywiByState[mywiState]?.[year]?.social;
            return acc;
          }, {})
        },
        {
          metric: 'Environmental',
          ...selectedYears.reduce((acc, year) => {
            acc[year] = mywiByState[mywiState]?.[year]?.environmental;
            return acc;
          }, {})
        }
      ];
    }
  };

  // Prepare radar chart data
  const getRadarData = () => {
    const components = ['education', 'working_life', 'income_distribution', 'housing', 'health', 'public_safety'];
    const labels = {
      education: 'Education',
      working_life: 'Working Life',
      income_distribution: 'Income',
      housing: 'Housing',
      health: 'Health',
      public_safety: 'Safety'
    };

    if (comparisonMode === 'states') {
      if (selectedStates.length === 0) return [];

      return components.map(comp => {
        const dataPoint = { component: labels[comp] };
        selectedStates.forEach(state => {
          const mywiState = getMyWIStateName(state);
          dataPoint[state] = mywiLatest[mywiState]?.components?.[comp] || 0;
        });
        return dataPoint;
      });
    } else {
      // Year comparison mode
      if (!selectedState || selectedYears.length === 0) return [];

      const mywiState = getMyWIStateName(selectedState);

      return components.map(comp => {
        const dataPoint = { component: labels[comp] };
        selectedYears.forEach(year => {
          dataPoint[year] = mywiByState[mywiState]?.[year]?.components?.[comp] || 0;
        });
        return dataPoint;
      });
    }
  };

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
            <span className="font-bold">{entry.value?.toFixed(1)}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="bg-gradient-to-br from-teal-50 to-blue-50 rounded-2xl p-4 md:p-6 lg:p-8">
      {/* Header */}
      <div className="mb-4 md:mb-6">
        <div className="flex flex-col gap-3 mb-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                🔍 State & Year Comparison
              </h2>
              <p className="text-xs md:text-sm text-gray-600">
                {comparisonMode === 'states'
                  ? 'Select 2-5 states to compare their well-being indicators side-by-side'
                  : 'Select one state and multiple years to compare trends over time'}
              </p>
            </div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="px-3 py-2 md:px-4 md:py-2 bg-teal-600 text-white rounded-lg text-xs md:text-sm font-medium active:bg-teal-700 transition-colors whitespace-nowrap"
            >
              {isOpen ? 'Hide' : 'Select'}
            </button>
          </div>

          {/* Mode Toggle */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => switchMode('states')}
              className={`flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                comparisonMode === 'states'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-gray-700 active:bg-gray-100 border border-gray-300'
              }`}
            >
              By States
            </button>
            <button
              onClick={() => switchMode('years')}
              className={`flex-1 sm:flex-none px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                comparisonMode === 'years'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'bg-white text-gray-700 active:bg-gray-100 border border-gray-300'
              }`}
            >
              By Years
            </button>
          </div>
        </div>
      </div>

      {/* Selection Panel */}
      {isOpen && (
        <div className="bg-white rounded-lg p-4 md:p-6 mb-4 md:mb-6 shadow-md">
          {comparisonMode === 'states' ? (
            // State Selection
            <>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-700">
                  Selected: <strong>{selectedStates.length}</strong> / 5 states
                </p>
                {selectedStates.length > 0 && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Clear All
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-2">
                {availableStates.map(state => {
                  const isSelected = selectedStates.includes(state);
                  const colorIndex = selectedStates.indexOf(state);

                  return (
                    <button
                      key={state}
                      onClick={() => toggleState(state)}
                      disabled={!isSelected && selectedStates.length >= 5}
                      className={`px-3 py-2 rounded-lg text-xs md:text-sm font-medium transition-all touch-manipulation ${
                        isSelected
                          ? 'text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 active:bg-gray-300'
                      } ${!isSelected && selectedStates.length >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
                      style={isSelected ? { backgroundColor: STATE_COLORS[colorIndex] } : {}}
                    >
                      {state}
                      {isSelected && <span className="ml-1">✓</span>}
                    </button>
                  );
                })}
              </div>
            </>
          ) : (
            // Year Comparison Selection
            <>
              <div className="mb-4">
                <label className="block text-xs md:text-sm font-medium text-gray-700 mb-2">
                  Select State:
                </label>
                <select
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full md:w-64 px-3 py-2 md:px-4 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="">Choose a state...</option>
                  {availableStates.map(state => (
                    <option key={state} value={state}>{state}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <label className="block text-xs md:text-sm font-medium text-gray-700">
                    Select Years to Compare (2-5 years):
                  </label>
                  {selectedYears.length > 0 && (
                    <button
                      onClick={clearYearSelection}
                      className="text-xs md:text-sm text-red-600 active:text-red-800 font-medium self-start"
                    >
                      Clear Years
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  Selected: <strong>{selectedYears.length}</strong> / 5 years
                </p>

                <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
                  {availableYears.map((year, index) => {
                    const isSelected = selectedYears.includes(year);
                    const colorIndex = selectedYears.indexOf(year);

                    return (
                      <button
                        key={year}
                        onClick={() => toggleYear(year)}
                        disabled={!isSelected && selectedYears.length >= 5}
                        className={`px-2 py-2 md:px-3 rounded-lg text-xs md:text-sm font-medium transition-all touch-manipulation ${
                          isSelected
                            ? 'text-white shadow-md'
                            : 'bg-gray-100 text-gray-700 active:bg-gray-300'
                        } ${!isSelected && selectedYears.length >= 5 ? 'opacity-40 cursor-not-allowed' : ''}`}
                        style={isSelected ? { backgroundColor: STATE_COLORS[colorIndex] } : {}}
                      >
                        {year}
                        {isSelected && <span className="ml-1 text-xs">✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* Comparison Results */}
      {comparisonMode === 'states' ? (
        // States comparison mode validation
        selectedStates.length === 0 ? (
          <div className="bg-white rounded-lg p-8 md:p-12 text-center">
            <p className="text-gray-500 text-base md:text-lg mb-2">👆 Select states to start comparing</p>
            <p className="text-gray-400 text-xs md:text-sm">Choose 2-5 states to see their trends and metrics</p>
          </div>
        ) : selectedStates.length === 1 ? (
          <div className="bg-white rounded-lg p-8 md:p-12 text-center">
            <p className="text-gray-500 text-base md:text-lg mb-2">Add at least one more state</p>
            <p className="text-gray-400 text-xs md:text-sm">Comparison requires 2 or more states</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* States Comparison Charts */}
            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                MyWI Overall Trend Comparison (2010-2024)
              </h3>
              <ResponsiveContainer width="100%" height={300} className="md:!h-[350px]">
                <LineChart data={getTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    label={{ value: 'MyWI Overall', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 11 } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedStates.map((state, index) => (
                    <Line
                      key={state}
                      type="monotone"
                      dataKey={state}
                      stroke={STATE_COLORS[index]}
                      strokeWidth={2}
                      dot={{ fill: STATE_COLORS[index], r: 3 }}
                      activeDot={{ r: 5 }}
                      animationDuration={1000}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                Sub-Composite Comparison (2024)
              </h3>
              <ResponsiveContainer width="100%" height={250} className="md:!h-[300px]">
                <BarChart data={getSubCompositeData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="metric"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedStates.map((state, index) => (
                    <Bar
                      key={state}
                      dataKey={state}
                      fill={STATE_COLORS[index]}
                      animationDuration={1000}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                Key Components Comparison (2024)
              </h3>
              <ResponsiveContainer width="100%" height={320} className="md:!h-[400px]">
                <RadarChart data={getRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="component" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 150]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedStates.map((state, index) => (
                    <Radar
                      key={state}
                      name={state}
                      dataKey={state}
                      stroke={STATE_COLORS[index]}
                      fill={STATE_COLORS[index]}
                      fillOpacity={0.2}
                      animationDuration={1000}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                Quick Stats (Latest Data)
              </h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium text-gray-700 sticky left-0 bg-gray-50">Metric</th>
                      {selectedStates.map((state, index) => (
                        <th
                          key={state}
                          className="px-2 md:px-4 py-2 md:py-3 text-center font-medium whitespace-nowrap"
                          style={{ color: STATE_COLORS[index] }}
                        >
                          {state}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { label: 'MyWI Overall', key: 'mywi_overall', format: (v) => v?.toFixed(1) },
                      { label: 'Graduate Employment', key: 'graduateEmploymentRate', format: (v) => `${v?.toFixed(1)}%` },
                      { label: 'Unemployment Rate', key: 'unemployment_rate', format: (v) => `${v?.toFixed(1)}%` },
                      { label: 'Mean Income', key: 'mean_income', format: (v) => `RM ${v?.toLocaleString()}` },
                      { label: 'Gini Coefficient', key: 'gini', format: (v) => v?.toFixed(3) }
                    ].map(metric => (
                      <tr key={metric.key} className="hover:bg-gray-50">
                        <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-gray-700 sticky left-0 bg-white">{metric.label}</td>
                        {selectedStates.map(state => (
                          <td key={state} className="px-2 md:px-4 py-2 md:py-3 text-center text-gray-900 whitespace-nowrap">
                            {mergedData[state]?.[metric.key] !== undefined && mergedData[state]?.[metric.key] !== null
                              ? metric.format(mergedData[state][metric.key])
                              : 'N/A'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      ) : (
        // Years comparison mode validation
        !selectedState ? (
          <div className="bg-white rounded-lg p-8 md:p-12 text-center">
            <p className="text-gray-500 text-base md:text-lg mb-2">👆 Select a state first</p>
            <p className="text-gray-400 text-xs md:text-sm">Choose a state to compare across different years</p>
          </div>
        ) : selectedYears.length < 2 ? (
          <div className="bg-white rounded-lg p-8 md:p-12 text-center">
            <p className="text-gray-500 text-base md:text-lg mb-2">Select at least 2 years</p>
            <p className="text-gray-400 text-xs md:text-sm">Year comparison requires 2 or more years</p>
          </div>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {/* Years Comparison Charts */}
            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                MyWI Overall Trend - {selectedState} (Across Years)
              </h3>
              <ResponsiveContainer width="100%" height={300} className="md:!h-[350px]">
                <LineChart data={getTrendData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="year"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                    label={{ value: 'MyWI Overall', angle: -90, position: 'insideLeft', style: { fill: '#6b7280', fontSize: 11 } }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="All Years"
                    stroke="#d1d5db"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    dot={false}
                    name={`${selectedState} (All Years)`}
                  />
                  {selectedYears.map((year, index) => (
                    <Line
                      key={year}
                      type="monotone"
                      dataKey={year}
                      stroke={STATE_COLORS[index]}
                      strokeWidth={3}
                      dot={{ fill: STATE_COLORS[index], r: 5 }}
                      activeDot={{ r: 7 }}
                      animationDuration={1000}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                Sub-Composite Comparison - {selectedState}
              </h3>
              <ResponsiveContainer width="100%" height={250} className="md:!h-[300px]">
                <BarChart data={getSubCompositeData()} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis
                    dataKey="metric"
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <YAxis
                    tick={{ fill: '#6b7280', fontSize: 11 }}
                    tickLine={{ stroke: '#e5e7eb' }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedYears.map((year, index) => (
                    <Bar
                      key={year}
                      dataKey={year}
                      fill={STATE_COLORS[index]}
                      animationDuration={1000}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                Key Components Comparison - {selectedState}
              </h3>
              <ResponsiveContainer width="100%" height={320} className="md:!h-[400px]">
                <RadarChart data={getRadarData()} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="component" tick={{ fill: '#6b7280', fontSize: 11 }} />
                  <PolarRadiusAxis angle={90} domain={[0, 150]} tick={{ fill: '#6b7280', fontSize: 10 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  {selectedYears.map((year, index) => (
                    <Radar
                      key={year}
                      name={year}
                      dataKey={year}
                      stroke={STATE_COLORS[index]}
                      fill={STATE_COLORS[index]}
                      fillOpacity={0.2}
                      animationDuration={1000}
                    />
                  ))}
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-xl p-4 md:p-6">
              <h3 className="text-base md:text-lg font-bold text-gray-900 mb-3 md:mb-4">
                Year-over-Year Comparison - {selectedState}
              </h3>
              <div className="overflow-x-auto -mx-4 md:mx-0">
                <table className="w-full text-xs md:text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-2 md:px-4 py-2 md:py-3 text-left font-medium text-gray-700 sticky left-0 bg-gray-50">Component</th>
                      {selectedYears.sort().map((year, index) => (
                        <th
                          key={year}
                          className="px-2 md:px-4 py-2 md:py-3 text-center font-medium whitespace-nowrap"
                          style={{ color: STATE_COLORS[index] }}
                        >
                          {year}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {[
                      { label: 'Overall', key: 'overall' },
                      { label: 'Economic', key: 'economic' },
                      { label: 'Social', key: 'social' },
                      { label: 'Environmental', key: 'environmental' }
                    ].map(metric => {
                      const mywiState = getMyWIStateName(selectedState);
                      return (
                        <tr key={metric.key} className="hover:bg-gray-50">
                          <td className="px-2 md:px-4 py-2 md:py-3 font-medium text-gray-700 sticky left-0 bg-white">{metric.label}</td>
                          {selectedYears.sort().map(year => (
                            <td key={year} className="px-2 md:px-4 py-2 md:py-3 text-center text-gray-900 whitespace-nowrap">
                              {mywiByState[mywiState]?.[year]?.[metric.key]?.toFixed(1) || 'N/A'}
                            </td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}
