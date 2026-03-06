/**
 * StateList - Clickable list of all Malaysian states
 * Makes it easy to select small/hard-to-click states
 */

import { useState, useMemo } from 'react';
import graduateData from '../data/graduates/graduate-employment-by-state-2024.json';
import summaryData from '../data/summary-by-state.json';

export default function StateList() {
  const [selectedState, setSelectedState] = useState(null);

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

  // States grouped by region
  const statesByRegion = {
    'NORTHERN': ['Perlis', 'Kedah', 'Pulau Pinang', 'Perak'],
    'CENTRAL': ['Selangor', 'W.P. Kuala Lumpur', 'W.P. Putrajaya'],
    'SOUTHERN': ['Negeri Sembilan', 'Melaka', 'Johor'],
    'EAST COAST': ['Kelantan', 'Terengganu', 'Pahang'],
    'EAST MALAYSIA': ['Sabah', 'Sarawak', 'W.P. Labuan']
  };

  const handleStateClick = (stateName) => {
    setSelectedState(stateName);

    // Find the merged state data (includes both summary and graduate data)
    const stateData = mergedData[stateName];

    if (stateData) {
      // Dispatch the same event as clicking on the map
      window.dispatchEvent(new CustomEvent('stateClick', {
        detail: { stateName, stateData }
      }));
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-6 border border-gray-200">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span>📍</span>
        <span>Quick State Selection</span>
      </h3>
      <p className="text-sm text-gray-600 mb-4">
        Click on any state name to view its metrics
      </p>

      <div className="space-y-1">
        {Object.entries(statesByRegion).map(([region, states]) => (
          <div key={region}>
            <h4 className="font-semibold tracking-wider text-xs text-gray-400 mb-1 mt-3">
              {region}
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {states.map((state) => (
                <button
                  key={state}
                  onClick={() => handleStateClick(state)}
                  className={`
                    text-left px-3 py-2 rounded-lg text-sm font-medium
                    transition-all duration-200
                    ${selectedState === state
                      ? 'bg-teal-500 text-white shadow-md transform scale-105'
                      : 'bg-white text-gray-700 hover:bg-teal-50 hover:text-teal-700 border border-gray-200 hover:border-teal-300'
                    }
                  `}
                >
                  {state}
                  {selectedState === state && (
                    <span className="ml-1 text-xs">✓</span>
                  )}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          💡 Tip: Use this list for smaller states like Perlis or W.P. Labuan
        </p>
      </div>
    </div>
  );
}
