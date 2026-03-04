import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load CSV files
const youthData = fs.readFileSync(
  path.join(__dirname, '../data/MONTHLY_SERIES/lfs_month_youth.csv'),
  'utf-8'
);

const overallData = fs.readFileSync(
  path.join(__dirname, '../data/MONTHLY_SERIES/lfs_month_sa.csv'),
  'utf-8'
);

// Parse CSVs
const youthRecords = parse(youthData, { columns: true });
const overallRecords = parse(overallData, { columns: true });

// Process time series data
function processTimeSeries() {
  // Filter data from 2016-2025
  const startYear = 2016;
  const endYear = 2025;

  const trendData = [];

  // Create a map of overall data by date
  const overallMap = {};
  overallRecords.forEach(record => {
    const date = record.date;
    overallMap[date] = {
      unemployment_rate: parseFloat(record.u_rate),
      unemployed: parseFloat(record.lf_unemployed),
      labour_force: parseFloat(record.lf)
    };
  });

  // Process youth data and merge with overall data
  youthRecords.forEach(record => {
    const date = record.date;
    const year = parseInt(date.substring(0, 4));

    if (year >= startYear && year <= endYear) {
      const overall = overallMap[date];

      if (overall) {
        trendData.push({
          date,
          year,
          month: parseInt(date.substring(5, 7)),

          // Youth unemployment (15-24)
          youth_unemployed: parseFloat(record.unemployed_15_24),
          youth_unemployment_rate: parseFloat(record.u_rate_15_24),

          // Overall unemployment
          overall_unemployed: overall.unemployed,
          overall_unemployment_rate: overall.unemployment_rate,
          labour_force: overall.labour_force
        });
      }
    }
  });

  // Sort by date
  trendData.sort((a, b) => a.date.localeCompare(b.date));

  return trendData;
}

// Calculate annual averages
function calculateAnnualAverages(trendData) {
  const yearlyData = {};

  trendData.forEach(record => {
    const year = record.year;
    if (!yearlyData[year]) {
      yearlyData[year] = {
        year,
        youth_rates: [],
        overall_rates: [],
        youth_unemployed: [],
        overall_unemployed: [],
        labour_force: []
      };
    }

    yearlyData[year].youth_rates.push(record.youth_unemployment_rate);
    yearlyData[year].overall_rates.push(record.overall_unemployment_rate);
    yearlyData[year].youth_unemployed.push(record.youth_unemployed);
    yearlyData[year].overall_unemployed.push(record.overall_unemployed);
    yearlyData[year].labour_force.push(record.labour_force);
  });

  // Calculate averages
  const annualAverages = Object.keys(yearlyData)
    .map(year => {
      const data = yearlyData[year];
      return {
        year: parseInt(year),
        youth_unemployment_rate: Math.round(
          (data.youth_rates.reduce((a, b) => a + b, 0) / data.youth_rates.length) * 10
        ) / 10,
        overall_unemployment_rate: Math.round(
          (data.overall_rates.reduce((a, b) => a + b, 0) / data.overall_rates.length) * 10
        ) / 10,
        youth_unemployed: Math.round(
          data.youth_unemployed.reduce((a, b) => a + b, 0) / data.youth_unemployed.length
        ),
        overall_unemployed: Math.round(
          data.overall_unemployed.reduce((a, b) => a + b, 0) / data.overall_unemployed.length
        ),
        labour_force: Math.round(
          data.labour_force.reduce((a, b) => a + b, 0) / data.labour_force.length
        )
      };
    })
    .sort((a, b) => a.year - b.year);

  return annualAverages;
}

// Main execution
console.log('Processing time series data...');
const trendData = processTimeSeries();
const annualData = calculateAnnualAverages(trendData);

// Create output
const output = {
  monthly: trendData,
  annual: annualData,
  metadata: {
    period: `${trendData[0].date} to ${trendData[trendData.length - 1].date}`,
    total_months: trendData.length,
    years_covered: annualData.map(d => d.year),
    description: 'Youth (15-24) vs. Overall unemployment rates in Malaysia',
    source: 'Department of Statistics Malaysia - Monthly Labour Force Survey'
  }
};

// Create output directory
const outputDir = path.join(__dirname, '../src/data/labour');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created labour directory');
}

// Write output
const outputPath = path.join(outputDir, 'unemployment-trend.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

console.log(`✓ Time series processed: ${trendData.length} monthly records`);
console.log(`✓ Annual averages calculated: ${annualData.length} years`);
console.log(`✓ Output written to: ${outputPath}`);

// Print summary
console.log(`\nYouth vs Overall Unemployment Trends:`);
annualData.forEach(data => {
  const gap = data.youth_unemployment_rate - data.overall_unemployment_rate;
  console.log(`  ${data.year}: Youth ${data.youth_unemployment_rate}% | Overall ${data.overall_unemployment_rate}% | Gap: ${gap.toFixed(1)}%`);
});

// Calculate trend
const firstYear = annualData[0];
const lastYear = annualData[annualData.length - 1];
const youthChange = lastYear.youth_unemployment_rate - firstYear.youth_unemployment_rate;
const overallChange = lastYear.overall_unemployment_rate - firstYear.overall_unemployment_rate;

console.log(`\nChange from ${firstYear.year} to ${lastYear.year}:`);
console.log(`  Youth: ${youthChange > 0 ? '+' : ''}${youthChange.toFixed(1)}%`);
console.log(`  Overall: ${overallChange > 0 ? '+' : ''}${overallChange.toFixed(1)}%`);
