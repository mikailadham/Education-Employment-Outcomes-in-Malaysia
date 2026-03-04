/**
 * QuadrantScatter - THE MOST IMPORTANT COMPONENT
 * Quadrant scatter plot showing Education Supply Index (ESI) vs Employment Outcome Index (EOI)
 * Four quadrants indicate strategic policy priorities for each state
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell, Label } from 'recharts';
import compositeIndices from '../data/analytics/composite-indices.json';

export default function QuadrantScatter() {
  // Transform data
  const chartData = Object.values(compositeIndices).map(state => ({
    state: state.state,
    esi: state.education_supply_index,
    eoi: state.employment_outcome_index,
    eeai: state.eeai,
    population: state.estimated_population,
    unemployment: state.unemployment_rate,
    lfpr: state.participation_rate
  }));

  // Calculate median values for reference lines
  const esiValues = chartData.map(d => d.esi).sort((a, b) => a - b);
  const eoiValues = chartData.map(d => d.eoi).sort((a, b) => a - b);
  const medianESI = esiValues[Math.floor(esiValues.length / 2)];
  const medianEOI = eoiValues[Math.floor(eoiValues.length / 2)];

  // Determine quadrant for each state
  const getQuadrant = (esi, eoi) => {
    if (esi >= medianESI && eoi >= medianEOI) return 'optimal';
    if (esi >= medianESI && eoi < medianEOI) return 'oversupply';
    if (esi < medianESI && eoi >= medianEOI) return 'shortage';
    return 'development';
  };

  // Color based on quadrant
  const getColor = (esi, eoi) => {
    const quadrant = getQuadrant(esi, eoi);
    switch (quadrant) {
      case 'optimal': return '#10b981'; // Green
      case 'oversupply': return '#f59e0b'; // Orange
      case 'shortage': return '#3b82f6'; // Blue
      case 'development': return '#ef4444'; // Red
      default: return '#6b7280';
    }
  };

  // Group states by quadrant
  const quadrantStats = {
    optimal: chartData.filter(d => getQuadrant(d.esi, d.eoi) === 'optimal').length,
    oversupply: chartData.filter(d => getQuadrant(d.esi, d.eoi) === 'oversupply').length,
    shortage: chartData.filter(d => getQuadrant(d.esi, d.eoi) === 'shortage').length,
    development: chartData.filter(d => getQuadrant(d.esi, d.eoi) === 'development').length
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const quadrant = getQuadrant(data.esi, data.eoi);
    const quadrantLabels = {
      optimal: 'Optimal Alignment',
      oversupply: 'Oversupply Risk',
      shortage: 'Education Shortage',
      development: 'Development Priority'
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.state}</p>
        <div className="space-y-1 text-sm mb-2">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Education Supply Index:</span>
            <span className="font-bold">{data.esi.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Employment Outcome Index:</span>
            <span className="font-bold">{data.eoi.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">EEAI Score:</span>
            <span className="font-bold">{data.eeai.toFixed(1)}</span>
          </div>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded ${
          quadrant === 'optimal' ? 'bg-green-100 text-green-700' :
          quadrant === 'oversupply' ? 'bg-orange-100 text-orange-700' :
          quadrant === 'shortage' ? 'bg-blue-100 text-blue-700' :
          'bg-red-100 text-red-700'
        }`}>
          {quadrantLabels[quadrant]}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl border-4 border-blue-500">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-2xl font-bold text-gray-900">
            Education-Employment Alignment Matrix
          </h3>
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full">
            KEY INSIGHT
          </span>
        </div>
        <p className="text-sm text-gray-600">
          This quadrant analysis reveals the strategic positioning of each state in terms of education supply and employment outcomes.
          States are classified into four categories based on median ESI and EOI values.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={600}>
        <ScatterChart margin={{ top: 30, right: 30, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

          {/* Axes */}
          <XAxis
            type="number"
            dataKey="esi"
            name="Education Supply Index"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Education Supply Index (ESI)',
              position: 'bottom',
              offset: 40,
              style: { fill: '#1f2937', fontSize: 14, fontWeight: 'bold' }
            }}
            domain={[0, 100]}
          />
          <YAxis
            type="number"
            dataKey="eoi"
            name="Employment Outcome Index"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Employment Outcome Index (EOI)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#1f2937', fontSize: 14, fontWeight: 'bold' }
            }}
            domain={[0, 100]}
          />

          {/* Reference lines at median values */}
          <ReferenceLine
            x={medianESI}
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="8 4"
          >
            <Label
              value={`Median ESI: ${medianESI.toFixed(1)}`}
              position="top"
              fill="#6b7280"
              fontSize={11}
              fontWeight="bold"
            />
          </ReferenceLine>

          <ReferenceLine
            y={medianEOI}
            stroke="#9ca3af"
            strokeWidth={2}
            strokeDasharray="8 4"
          >
            <Label
              value={`Median EOI: ${medianEOI.toFixed(1)}`}
              position="right"
              fill="#6b7280"
              fontSize={11}
              fontWeight="bold"
            />
          </ReferenceLine>

          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

          {/* Data points - hover to see state names */}
          <Scatter data={chartData} fill="#3b82f6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.esi, entry.eoi)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Quadrant Labels - Positioned in corners */}
      <div className="relative -mt-16 mb-16 px-12">
        <div className="absolute top-0 right-0 bg-green-50 border-2 border-green-500 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold text-green-700">Optimal Alignment</p>
          <p className="text-xs text-green-600">High ESI + High EOI</p>
        </div>
        <div className="absolute top-0 left-0 bg-orange-50 border-2 border-orange-500 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold text-orange-700">Oversupply Risk</p>
          <p className="text-xs text-orange-600">High ESI + Low EOI</p>
        </div>
        <div className="absolute bottom-0 right-0 bg-blue-50 border-2 border-blue-500 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold text-blue-700">Education Shortage</p>
          <p className="text-xs text-blue-600">Low ESI + High EOI</p>
        </div>
        <div className="absolute bottom-0 left-0 bg-red-50 border-2 border-red-500 rounded-lg p-3 shadow-lg">
          <p className="text-sm font-bold text-red-700">Development Priority</p>
          <p className="text-xs text-red-600">Low ESI + Low EOI</p>
        </div>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-green-50 rounded-lg p-4 border-2 border-green-200">
          <p className="text-xs text-green-600 mb-1">Optimal Alignment</p>
          <p className="text-3xl font-bold text-green-700">{quadrantStats.optimal}</p>
          <p className="text-xs text-green-600 mt-1">states performing well</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4 border-2 border-orange-200">
          <p className="text-xs text-orange-600 mb-1">Oversupply Risk</p>
          <p className="text-3xl font-bold text-orange-700">{quadrantStats.oversupply}</p>
          <p className="text-xs text-orange-600 mt-1">need job creation focus</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <p className="text-xs text-blue-600 mb-1">Education Shortage</p>
          <p className="text-3xl font-bold text-blue-700">{quadrantStats.shortage}</p>
          <p className="text-xs text-blue-600 mt-1">need education expansion</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-2 border-red-200">
          <p className="text-xs text-red-600 mb-1">Development Priority</p>
          <p className="text-3xl font-bold text-red-700">{quadrantStats.development}</p>
          <p className="text-xs text-red-600 mt-1">need comprehensive support</p>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
        <p className="text-sm text-blue-900">
          <strong>Policy Insight:</strong> States in different quadrants require tailored interventions.
          Optimal states should maintain balance, oversupply states need economic diversification,
          shortage states require education infrastructure, and development priority states need holistic support.
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Composite indices calculated from MOE, DOSM, and MOHE data (2022-2023)
      </div>
    </div>
  );
}
