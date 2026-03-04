/**
 * ProductivityHeatmap - Heatmap showing labour productivity by main economic sectors
 * Displays productivity per hour and productivity per employee
 */

import { useState } from 'react';
import productivityData from '../data/labour/productivity-by-sector.json';

export default function ProductivityHeatmap() {
  const [metric, setMetric] = useState('productivity_per_hour'); // or 'productivity_per_employee'

  // Get main sectors only (level 1, is_main_sector = true)
  const mainSectors = productivityData.main_sectors;

  // Find min and max values for color scaling
  const values = mainSectors.map(s => s[metric]);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);

  // Color scale function - blue to red gradient
  const getColor = (value) => {
    const normalized = (value - minValue) / (maxValue - minValue);

    if (normalized < 0.2) return 'bg-blue-100 text-blue-900';
    if (normalized < 0.4) return 'bg-blue-200 text-blue-900';
    if (normalized < 0.6) return 'bg-yellow-200 text-yellow-900';
    if (normalized < 0.8) return 'bg-orange-300 text-orange-900';
    return 'bg-red-400 text-red-900';
  };

  // Get intensity for border
  const getIntensity = (value) => {
    const normalized = (value - minValue) / (maxValue - minValue);
    return Math.round(normalized * 4);
  };

  // Format value based on metric
  const formatValue = (value) => {
    if (metric === 'productivity_per_hour') {
      return `RM ${value.toFixed(1)}`;
    }
    return `RM ${(value / 1000).toFixed(1)}k`;
  };

  // Calculate statistics
  const avgProductivity = (values.reduce((sum, v) => sum + v, 0) / values.length);
  const highestSector = mainSectors.reduce((max, s) => s[metric] > max[metric] ? s : max, mainSectors[0]);
  const lowestSector = mainSectors.reduce((min, s) => s[metric] < min[metric] ? s : min, mainSectors[0]);

  return (
    <div className="bg-white p-4 md:p-6 rounded-xl">
      <div className="mb-6">
        <div className="flex flex-col gap-3 mb-2">
          <div>
            <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
              Labour Productivity by Sector (2025)
            </h3>
            <p className="text-xs md:text-sm text-gray-600">
              Comparing productivity across Malaysia's main economic sectors. Higher values indicate greater economic output per unit of labour.
            </p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setMetric('productivity_per_hour')}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                metric === 'productivity_per_hour'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-300'
              }`}
            >
              Per Hour
            </button>
            <button
              onClick={() => setMetric('productivity_per_employee')}
              className={`px-3 py-2 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                metric === 'productivity_per_employee'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-600 active:bg-gray-300'
              }`}
            >
              Per Employee
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="space-y-2 md:space-y-3">
        {mainSectors.map((sector, index) => {
          const value = sector[metric];
          const intensity = getIntensity(value);

          return (
            <div
              key={index}
              className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4"
            >
              {/* Sector Name */}
              <div className="text-xs md:text-sm font-medium text-gray-700 md:w-40 lg:w-48">
                {sector.name}
              </div>

              {/* Heatmap Cell */}
              <div className="flex-1">
                <div
                  className={`relative h-14 md:h-16 rounded-lg flex items-center justify-between px-3 md:px-4 ${getColor(value)} transition-all shadow-sm active:shadow-md touch-manipulation cursor-pointer`}
                  style={{
                    borderWidth: intensity + 1,
                    borderColor: 'rgba(0,0,0,0.1)'
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <span className="font-bold text-base md:text-lg">
                    {formatValue(value)}
                  </span>

                  {/* Additional metrics - always visible on mobile */}
                  <div className="text-xs">
                    <div className="whitespace-nowrap">GDP: RM {(sector.gdp / 1000).toFixed(0)}B</div>
                    <div className="whitespace-nowrap">Employment: {(sector.employment / 1000).toFixed(0)}k</div>
                  </div>
                </div>
              </div>

              {/* Bar indicator - hidden on small mobile */}
              <div className="hidden sm:block w-20 md:w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all"
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Color Legend */}
      <div className="mt-6 flex items-center justify-center gap-2">
        <span className="text-xs text-gray-600">Low</span>
        <div className="flex gap-1">
          <div className="w-12 h-6 bg-blue-100 rounded" />
          <div className="w-12 h-6 bg-blue-200 rounded" />
          <div className="w-12 h-6 bg-yellow-200 rounded" />
          <div className="w-12 h-6 bg-orange-300 rounded" />
          <div className="w-12 h-6 bg-red-400 rounded" />
        </div>
        <span className="text-xs text-gray-600">High</span>
      </div>

      {/* Summary Statistics */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-xs text-green-600 mb-1">Highest Productivity</p>
          <p className="text-2xl font-bold text-green-700">
            {formatValue(highestSector[metric])}
          </p>
          <p className="text-xs text-green-600 mt-1">{highestSector.name}</p>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-xs text-blue-600 mb-1">Average Productivity</p>
          <p className="text-2xl font-bold text-blue-700">
            {formatValue(avgProductivity)}
          </p>
          <p className="text-xs text-blue-600 mt-1">across all sectors</p>
        </div>
        <div className="bg-orange-50 rounded-lg p-4">
          <p className="text-xs text-orange-600 mb-1">Lowest Productivity</p>
          <p className="text-2xl font-bold text-orange-700">
            {formatValue(lowestSector[metric])}
          </p>
          <p className="text-xs text-orange-600 mt-1">{lowestSector.name}</p>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: Department of Statistics Malaysia, Labour Productivity 2025. Values in constant 2015 prices.
      </div>
    </div>
  );
}
