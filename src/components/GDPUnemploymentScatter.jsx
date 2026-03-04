/**
 * GDPUnemploymentScatter - Scatter plot showing relationship between GDP per capita and unemployment rate
 * Includes trendline and R² value to show correlation strength
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import summaryData from '../data/summary-by-state.json';

export default function GDPUnemploymentScatter() {
  // Transform data - calculate GDP per capita (in thousands)
  // First need to get estimated population from composite indices data
  const chartData = Object.entries(summaryData)
    .map(([stateName, state]) => {
      // Estimate population from labour force and participation rate
      const estimatedPopulation = state.labour_force && state.participation_rate
        ? (state.labour_force / state.participation_rate) * 100
        : null;

      // GDP per capita = (gdp_total in billions) / (estimated_population in thousands) * 1000
      const gdpPerCapita = state.gdp_total && estimatedPopulation
        ? (state.gdp_total / estimatedPopulation) * 1000
        : null;

      return {
        state: stateName.replace('W.P. ', ''),
        gdpPerCapita: gdpPerCapita,
        unemployment: state.unemployment_rate,
        population: estimatedPopulation,
        gdpTotal: state.gdp_total,
        employed: state.employed,
        lfpr: state.participation_rate
      };
    })
    .filter(d => d.gdpPerCapita !== null && d.unemployment !== null && !isNaN(d.gdpPerCapita));

  // Calculate linear regression for trendline
  const calculateTrendline = (data) => {
    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;

    data.forEach(point => {
      sumX += point.gdpPerCapita;
      sumY += point.unemployment;
      sumXY += point.gdpPerCapita * point.unemployment;
      sumX2 += point.gdpPerCapita * point.gdpPerCapita;
      sumY2 += point.unemployment * point.unemployment;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    // Calculate R²
    const yMean = sumY / n;
    const ssTotal = data.reduce((sum, point) => sum + Math.pow(point.unemployment - yMean, 2), 0);
    const ssResidual = data.reduce((sum, point) => {
      const predicted = slope * point.gdpPerCapita + intercept;
      return sum + Math.pow(point.unemployment - predicted, 2);
    }, 0);
    const rSquared = 1 - (ssResidual / ssTotal);

    return { slope, intercept, rSquared: rSquared.toFixed(3) };
  };

  const { slope, intercept, rSquared } = calculateTrendline(chartData);

  // Generate trendline points
  const xMin = Math.min(...chartData.map(d => d.gdpPerCapita));
  const xMax = Math.max(...chartData.map(d => d.gdpPerCapita));
  const trendlineData = [
    { gdpPerCapita: xMin, unemployment: slope * xMin + intercept },
    { gdpPerCapita: xMax, unemployment: slope * xMax + intercept }
  ];

  // Color based on unemployment rate
  const getColor = (unemployment) => {
    if (unemployment <= 2.5) return '#10b981'; // Green - low unemployment
    if (unemployment <= 4) return '#3b82f6'; // Blue - moderate
    if (unemployment <= 6) return '#f59e0b'; // Orange - concerning
    return '#ef4444'; // Red - high unemployment
  };

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.state}</p>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">GDP per Capita:</span>
            <span className="font-bold">RM {data.gdpPerCapita.toFixed(1)}k</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Unemployment Rate:</span>
            <span className="font-bold">{data.unemployment.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">LFPR:</span>
            <span className="font-bold">{data.lfpr?.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Population:</span>
            <span className="font-bold">{data.population?.toFixed(0)}k</span>
          </div>
        </div>
      </div>
    );
  };

  // Calculate statistics
  const avgGDP = (chartData.reduce((sum, d) => sum + d.gdpPerCapita, 0) / chartData.length).toFixed(1);
  const avgUnemployment = (chartData.reduce((sum, d) => sum + d.unemployment, 0) / chartData.length).toFixed(1);
  const correlation = slope < 0 ? 'Negative' : 'Positive';

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          GDP per Capita vs Unemployment Rate (2023)
        </h3>
        <p className="text-sm text-gray-600">
          Examining the relationship between economic output and unemployment. Trendline shows correlation strength (R² = {rSquared}).
        </p>
      </div>

      <ResponsiveContainer width="100%" height={500}>
        <ScatterChart margin={{ top: 20, right: 30, bottom: 60, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            type="number"
            dataKey="gdpPerCapita"
            name="GDP per Capita"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'GDP per Capita (RM thousands)',
              position: 'bottom',
              offset: 40,
              style: { fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }
            }}
          />
          <YAxis
            type="number"
            dataKey="unemployment"
            name="Unemployment Rate"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Unemployment Rate (%)',
              angle: -90,
              position: 'insideLeft',
              style: { fill: '#6b7280', fontSize: 12, fontWeight: 'bold' }
            }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />

          {/* Trendline */}
          <Scatter
            data={trendlineData}
            line={{ stroke: '#9ca3af', strokeWidth: 2, strokeDasharray: '5 5' }}
            shape={() => null}
            isAnimationActive={false}
          />

          {/* Data points */}
          <Scatter data={chartData} fill="#3b82f6">
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.unemployment)} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1">R² Value</p>
          <p className="text-2xl font-bold text-blue-700">{rSquared}</p>
          <p className="text-xs text-blue-600 mt-1">{correlation} correlation</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1">Avg GDP per Capita</p>
          <p className="text-2xl font-bold text-green-700">RM {avgGDP}k</p>
          <p className="text-xs text-green-600 mt-1">across all states</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs text-orange-600 mb-1">Avg Unemployment</p>
          <p className="text-2xl font-bold text-orange-700">{avgUnemployment}%</p>
          <p className="text-xs text-orange-600 mt-1">national average</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-xs text-purple-600 mb-1">Data Points</p>
          <p className="text-2xl font-bold text-purple-700">{chartData.length}</p>
          <p className="text-xs text-purple-600 mt-1">states analyzed</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Department of Statistics Malaysia, 2023 estimates. GDP in constant 2015 prices.
      </div>
    </div>
  );
}
