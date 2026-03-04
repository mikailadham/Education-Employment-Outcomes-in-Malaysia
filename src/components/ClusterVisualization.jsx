/**
 * ClusterVisualization - K-means clustering visualization showing state groupings
 * Colors states by cluster: Advanced Economies, Developing Markets, Emerging Regions
 * Shows cluster centroids to visualize group characteristics
 */

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from 'recharts';
import clusteringData from '../data/analytics/clustering-results.json';

export default function ClusterVisualization() {
  // Define cluster colors with proper mapping (must come first!)
  const clusterColorMap = {
    0: '#10b981', // Green - Advanced Economies
    1: '#3b82f6', // Blue - Developing Markets
    2: '#f59e0b'  // Orange - Emerging Regions
  };

  // Get actual cluster names
  const clusterNames = {
    0: 'Advanced Economies',
    1: 'Developing Markets',
    2: 'Emerging Regions'
  };

  // Transform state data
  const stateData = clusteringData.states.map(state => ({
    state: state.state,
    esi: state.esi,
    eoi: state.eoi,
    cluster: state.cluster,
    clusterName: state.cluster_name,
    clusterColor: state.cluster_color,
    unemployment: state.unemployment_rate,
    income: state.mean_income,
    population: state.estimated_population
  }));

  // Get cluster information and calculate centroids
  const clusters = clusteringData.clusters;
  const clusterCentroids = clusters.map((cluster, index) => ({
    name: cluster.name,
    esi: cluster.avgESI,
    eoi: cluster.avgEOI,
    color: clusterColorMap[index], // Use consistent colors from clusterColorMap
    count: cluster.count,
    states: cluster.states
  }));

  // Assign proper colors based on cluster
  const enhancedStateData = stateData.map(state => ({
    ...state,
    displayColor: clusterColorMap[state.cluster] || '#6b7280',
    displayName: clusterNames[state.cluster] || 'Unknown'
  }));

  // Custom tooltip
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const isCentroid = data.name; // Centroids have 'name' property

    if (isCentroid) {
      return (
        <div className="bg-white p-4 rounded-lg shadow-xl border-4 border-gray-800">
          <p className="font-bold text-gray-900 mb-2">Cluster Centroid: {data.name}</p>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Average ESI:</span>
              <span className="font-bold">{data.esi.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">Average EOI:</span>
              <span className="font-bold">{data.eoi.toFixed(1)}</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-600">States in Cluster:</span>
              <span className="font-bold">{data.count}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-gray-500">
            {data.states.join(', ')}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 rounded-lg shadow-xl border border-gray-200">
        <p className="font-bold text-gray-900 mb-2">{data.state}</p>
        <div className="space-y-1 text-sm mb-2">
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">ESI:</span>
            <span className="font-bold">{data.esi.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">EOI:</span>
            <span className="font-bold">{data.eoi.toFixed(1)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Mean Income:</span>
            <span className="font-bold">RM {data.income?.toLocaleString()}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-600">Unemployment:</span>
            <span className="font-bold">{data.unemployment?.toFixed(1)}%</span>
          </div>
        </div>
        <div className={`text-xs font-bold px-2 py-1 rounded`}
             style={{ backgroundColor: data.displayColor + '20', color: data.displayColor }}>
          {data.displayName}
        </div>
      </div>
    );
  };

  // Custom legend
  const CustomLegend = () => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {Object.entries(clusterNames).map(([clusterId, name]) => {
          const count = enhancedStateData.filter(s => s.cluster === parseInt(clusterId)).length;
          const color = clusterColorMap[clusterId];

          return (
            <div key={clusterId} className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: color }} />
              <span className="text-sm font-medium text-gray-700">
                {name} ({count})
              </span>
            </div>
          );
        })}
        <div className="flex items-center gap-2 px-3 py-2 bg-gray-800 text-white rounded-lg">
          <div className="w-4 h-4 rounded-full border-2 border-white bg-gray-800" />
          <span className="text-sm font-medium">
            Centroids ({clusterCentroids.length})
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-xl">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          K-Means Clustering Analysis (k={clusteringData.metadata.k})
        </h3>
        <p className="text-sm text-gray-600">
          States grouped by similar education and employment characteristics. Cluster centroids (marked with black border)
          represent the average position of each group. {clusteringData.metadata.features.length} features were used for clustering.
        </p>
      </div>

      <ResponsiveContainer width="100%" height={600} className="md:!h-[650px]">
        <ScatterChart margin={{ top: 30, right: 30, bottom: 70, left: 70 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

          <XAxis
            type="number"
            dataKey="esi"
            name="Education Supply Index"
            tick={{ fill: '#6b7280', fontSize: 12 }}
            tickLine={{ stroke: '#e5e7eb' }}
            label={{
              value: 'Education Supply Index (ESI)',
              position: 'bottom',
              offset: 50,
              style: { fill: '#1f2937', fontSize: 13, fontWeight: 'bold' }
            }}
            domain={[0, 90]}
            padding={{ left: 10, right: 10 }}
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
              offset: 10,
              style: { fill: '#1f2937', fontSize: 13, fontWeight: 'bold' }
            }}
            domain={[0, 100]}
            padding={{ top: 10, bottom: 10 }}
          />

          <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
          <Legend content={<CustomLegend />} />

          {/* State data points - hover to see details */}
          <Scatter data={enhancedStateData} fill="#3b82f6" shape="circle">
            {enhancedStateData.map((entry, index) => (
              <Cell key={`state-${index}`} fill={entry.displayColor} />
            ))}
          </Scatter>

          {/* Cluster centroids - larger points with black border */}
          <Scatter
            data={clusterCentroids}
            fill="#1f2937"
            shape="circle"
            legendType="none"
          >
            {clusterCentroids.map((entry, index) => (
              <Cell
                key={`centroid-${index}`}
                fill={entry.color}
                stroke="#000000"
                strokeWidth={3}
                r={10}
              />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>

      {/* Cluster Descriptions */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {clusterCentroids.map((cluster, index) => (
          <div
            key={index}
            className="rounded-lg p-4 border-2"
            style={{ borderColor: cluster.color, backgroundColor: cluster.color + '10' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-4 h-4 rounded-full" style={{ backgroundColor: cluster.color }} />
              <p className="font-bold text-gray-900">{cluster.name}</p>
            </div>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">States:</span>
                <span className="font-bold">{cluster.count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg ESI:</span>
                <span className="font-bold">{cluster.esi.toFixed(1)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Avg EOI:</span>
                <span className="font-bold">{cluster.eoi.toFixed(1)}</span>
              </div>
            </div>
            <div className="mt-2 text-xs text-gray-600">
              {cluster.states.join(', ')}
            </div>
          </div>
        ))}
      </div>

      {/* Clustering Insights */}
      <div className="mt-6 bg-purple-50 border-l-4 border-purple-500 p-4 rounded">
        <p className="text-sm text-purple-900">
          <strong>Clustering Insight:</strong> The K-means algorithm identified {clusteringData.metadata.k} distinct groups
          based on {clusteringData.metadata.features.length} indicators including education supply, employment outcomes,
          unemployment rates, income levels, and well-being metrics. States within each cluster share similar characteristics
          and may benefit from similar policy approaches.
        </p>
      </div>

      <div className="mt-4 text-xs text-gray-500 text-center">
        Source: K-means clustering analysis using standardized composite indices from multiple government sources
      </div>
    </div>
  );
}
