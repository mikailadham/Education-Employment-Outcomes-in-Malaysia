import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Simple K-means implementation
class KMeans {
  constructor(k, maxIterations = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.centroids = [];
    this.clusters = [];
  }

  // Calculate Euclidean distance
  distance(a, b) {
    return Math.sqrt(a.reduce((sum, val, i) => sum + Math.pow(val - b[i], 2), 0));
  }

  // Initialize centroids using k-means++
  initializeCentroids(data) {
    const centroids = [];
    // Pick first centroid randomly
    centroids.push(data[Math.floor(Math.random() * data.length)].values);

    // Pick remaining centroids
    for (let i = 1; i < this.k; i++) {
      const distances = data.map(point => {
        const minDist = Math.min(...centroids.map(c => this.distance(point.values, c)));
        return minDist * minDist;
      });

      const sum = distances.reduce((a, b) => a + b, 0);
      let random = Math.random() * sum;

      for (let j = 0; j < distances.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          centroids.push(data[j].values);
          break;
        }
      }
    }

    return centroids;
  }

  // Assign points to nearest centroid
  assignClusters(data) {
    return data.map(point => {
      const distances = this.centroids.map(c => this.distance(point.values, c));
      return distances.indexOf(Math.min(...distances));
    });
  }

  // Update centroids
  updateCentroids(data, assignments) {
    const newCentroids = [];

    for (let i = 0; i < this.k; i++) {
      const clusterPoints = data.filter((_, idx) => assignments[idx] === i);

      if (clusterPoints.length === 0) {
        // Keep old centroid if cluster is empty
        newCentroids.push(this.centroids[i]);
      } else {
        const dimensions = clusterPoints[0].values.length;
        const centroid = [];

        for (let d = 0; d < dimensions; d++) {
          const avg = clusterPoints.reduce((sum, p) => sum + p.values[d], 0) / clusterPoints.length;
          centroid.push(avg);
        }

        newCentroids.push(centroid);
      }
    }

    return newCentroids;
  }

  // Run k-means clustering
  fit(data) {
    this.centroids = this.initializeCentroids(data);

    for (let iter = 0; iter < this.maxIterations; iter++) {
      const assignments = this.assignClusters(data);
      const newCentroids = this.updateCentroids(data, assignments);

      // Check for convergence
      const converged = this.centroids.every((c, i) =>
        c.every((val, j) => Math.abs(val - newCentroids[i][j]) < 0.0001)
      );

      this.centroids = newCentroids;

      if (converged) {
        console.log(`  Converged after ${iter + 1} iterations`);
        break;
      }
    }

    return this.assignClusters(data);
  }
}

// Normalize data to 0-1 scale
function normalizeData(data, feature) {
  const values = data.map(d => d[feature]).filter(v => v !== null);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;

  return data.map(d => {
    if (d[feature] === null) return { ...d, [`${feature}_normalized`]: 0.5 };
    return {
      ...d,
      [`${feature}_normalized`]: range > 0 ? (d[feature] - min) / range : 0.5
    };
  });
}

// Prepare clustering data
function prepareClusteringData() {
  // Load composite indices
  const indicesPath = path.join(__dirname, '../src/data/analytics/composite-indices.json');
  if (!fs.existsSync(indicesPath)) {
    console.error('Error: Composite indices not found. Run calculate-composite-indices.js first.');
    process.exit(1);
  }

  const indices = JSON.parse(fs.readFileSync(indicesPath, 'utf-8'));

  // Prepare data for clustering
  const states = Object.keys(indices).filter(state => {
    const data = indices[state];
    // Only include states with complete data
    return data.education_supply_index !== null &&
           data.employment_outcome_index !== null &&
           data.unemployment_rate !== null &&
           data.mean_income !== null &&
           data.gdp_total !== null;
  });

  console.log(`Preparing clustering for ${states.length} states with complete data`);

  // Extract features for clustering
  let data = states.map(state => ({
    state,
    esi: indices[state].education_supply_index,
    eoi: indices[state].employment_outcome_index,
    unemployment_rate: indices[state].unemployment_rate,
    mean_income: indices[state].mean_income,
    gdp_total: indices[state].gdp_total,
    participation_rate: indices[state].participation_rate,
    school_completion_rate: indices[state].school_completion_rate,
    mywi_overall: indices[state].mywi_overall
  }));

  // Normalize features
  const features = [
    'esi', 'eoi', 'unemployment_rate', 'mean_income', 'gdp_total',
    'participation_rate', 'school_completion_rate', 'mywi_overall'
  ];

  features.forEach(feature => {
    data = normalizeData(data, feature);
  });

  // Create feature vectors
  const featureVectors = data.map(d => ({
    state: d.state,
    values: [
      d.esi_normalized || 0.5,
      d.eoi_normalized || 0.5,
      1 - (d.unemployment_rate_normalized || 0.5), // Invert unemployment (lower is better)
      d.mean_income_normalized || 0.5,
      d.gdp_total_normalized || 0.5,
      d.participation_rate_normalized || 0.5,
      d.school_completion_rate_normalized || 0.5,
      d.mywi_overall_normalized || 0.5
    ],
    raw: {
      esi: d.esi,
      eoi: d.eoi,
      unemployment_rate: d.unemployment_rate,
      mean_income: d.mean_income,
      gdp_total: d.gdp_total,
      participation_rate: d.participation_rate,
      school_completion_rate: d.school_completion_rate,
      mywi_overall: d.mywi_overall
    }
  }));

  return { featureVectors, indices };
}

// Define cluster labels based on characteristics
function labelClusters(assignments, featureVectors, k) {
  const clusterStats = [];

  // For each cluster
  for (let clusterIdx = 0; clusterIdx < k; clusterIdx++) {
    const states = featureVectors.filter((_, idx) => assignments[idx] === clusterIdx);

    if (states.length === 0) continue;

    const avgESI = states.reduce((sum, s) => sum + s.raw.esi, 0) / states.length;
    const avgEOI = states.reduce((sum, s) => sum + s.raw.eoi, 0) / states.length;
    const avgIncome = states.reduce((sum, s) => sum + s.raw.mean_income, 0) / states.length;
    const avgUnemployment = states.reduce((sum, s) => sum + s.raw.unemployment_rate, 0) / states.length;
    const avgGDP = states.reduce((sum, s) => sum + s.raw.gdp_total, 0) / states.length;

    clusterStats.push({
      cluster: clusterIdx,
      count: states.length,
      avgESI,
      avgEOI,
      avgIncome,
      avgUnemployment,
      avgGDP,
      states: states.map(s => s.state)
    });
  }

  // Sort by average income + GDP to assign labels
  clusterStats.sort((a, b) => (b.avgIncome + b.avgGDP) - (a.avgIncome + a.avgGDP));

  const labels = [
    { name: 'Advanced Economies', color: '#10b981', description: 'High income, strong education and employment outcomes' },
    { name: 'Developing Markets', color: '#f59e0b', description: 'Moderate income, improving education and employment' },
    { name: 'Emerging Regions', color: '#ef4444', description: 'Lower income, development opportunities' }
  ];

  return clusterStats.map((stat, idx) => ({
    ...stat,
    ...labels[Math.min(idx, labels.length - 1)]
  }));
}

// Main execution
console.log('Preparing K-means clustering...');
const { featureVectors, indices } = prepareClusteringData();

// Try different k values and choose best
const kValues = [3, 4];
const results = {};

kValues.forEach(k => {
  console.log(`\nRunning K-means with k=${k}...`);
  const kmeans = new KMeans(k);
  const assignments = kmeans.fit(featureVectors);

  results[k] = {
    k,
    assignments,
    centroids: kmeans.centroids
  };
});

// Use k=3 as default (Advanced, Developing, Emerging)
const k = 3;
const clustering = results[k];

console.log(`\nUsing k=${k} clustering`);

// Label clusters
const labeledClusters = labelClusters(clustering.assignments, featureVectors, k);

// Create cluster lookup map
const clusterLookup = {};
labeledClusters.forEach(cluster => {
  clusterLookup[cluster.cluster] = {
    name: cluster.name,
    color: cluster.color,
    description: cluster.description
  };
});

// Create output
const output = {
  metadata: {
    k,
    total_states: featureVectors.length,
    features: [
      'Education Supply Index',
      'Employment Outcome Index',
      'Unemployment Rate (inverted)',
      'Mean Income',
      'GDP Total',
      'Participation Rate',
      'School Completion Rate',
      'MyWI Overall'
    ],
    description: 'K-means clustering of Malaysian states based on education and employment indicators'
  },
  clusters: labeledClusters,
  states: featureVectors.map((fv, idx) => {
    const clusterIdx = clustering.assignments[idx];
    const clusterInfo = clusterLookup[clusterIdx] || { name: 'Unknown', color: '#gray', description: '' };

    return {
      state: fv.state,
      cluster: clusterIdx,
      cluster_name: clusterInfo.name,
      cluster_color: clusterInfo.color,
      ...fv.raw,
      ...indices[fv.state]
    };
  })
};

// Create output directory
const outputDir = path.join(__dirname, '../src/data/analytics');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write output
const outputPath = path.join(outputDir, 'clustering-results.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✓ Clustering completed`);
console.log(`✓ Output written to: ${outputPath}`);

// Print cluster summary
console.log(`\nCluster Summary:`);
labeledClusters.forEach(cluster => {
  console.log(`\n${cluster.name} (${cluster.count} states):`);
  console.log(`  Average Income: RM ${Math.round(cluster.avgIncome)}`);
  console.log(`  Average ESI: ${cluster.avgESI.toFixed(1)}`);
  console.log(`  Average EOI: ${cluster.avgEOI.toFixed(1)}`);
  console.log(`  Average Unemployment: ${cluster.avgUnemployment.toFixed(1)}%`);
  console.log(`  States: ${cluster.states.join(', ')}`);
});
