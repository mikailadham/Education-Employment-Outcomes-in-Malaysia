/**
 * Process PDF extract data for dashboard integration
 * Converts CSV data to JSON format matching existing structure
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// State name mapping (PDF names → Map names)
const STATE_NAME_MAP = {
  'Johor': 'Johor',
  'Kedah': 'Kedah',
  'Kelantan': 'Kelantan',
  'Melaka': 'Melaka',
  'Negeri Sembilan': 'Negeri Sembilan',
  'Pahang': 'Pahang',
  'Pulau Pinang': 'Pulau Pinang',
  'Perak': 'Perak',
  'Perlis': 'Perlis',
  'Selangor': 'Selangor',
  'Terengganu': 'Terengganu',
  'Sabah': 'Sabah',
  'Sarawak': 'Sarawak',
  'WP Kuala Lumpur': 'W.P. Kuala Lumpur',
  'WP Labuan': 'W.P. Labuan',
  'WP Putrajaya': 'W.P. Putrajaya'
};

/**
 * Parse CSV file
 */
function parseCSV(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.trim().split('\n');

  // Remove BOM if present
  const header = lines[0].replace(/^\uFEFF/, '').split(',');
  const rows = lines.slice(1);

  return rows.map(row => {
    const values = row.split(',');
    const obj = {};
    header.forEach((key, i) => {
      obj[key.trim()] = values[i] ? values[i].trim() : null;
    });
    return obj;
  });
}

/**
 * Process state snapshot 2024 data
 */
function processStateSnapshot() {
  console.log('Processing state snapshot 2024...');

  const data = parseCSV('data/PDF_EXTRACTS/state_snapshot_2024.csv');

  const processed = {};

  data.forEach(row => {
    const stateName = STATE_NAME_MAP[row.state] || row.state;

    processed[stateName] = {
      state: stateName,
      graduateEmploymentRate: parseFloat(row.employed_pct) || null,
      graduateUnemploymentRate: parseFloat(row.unemployed_pct) || null,
      totalGraduatesProduced: parseInt(row.total_graduates_produced) || null,
      graduatesEmployed: parseInt(row.employed_count) || null,
      graduatesUnemployed: parseInt(row.unemployed_count) || null,
      employmentAbsorptionRate: parseFloat(row.employment_absorption_rate) || null
    };
  });

  return processed;
}

/**
 * Process field analysis data
 */
function processFieldAnalysis() {
  console.log('Processing field analysis...');

  const data = parseCSV('data/PDF_EXTRACTS/field_analysis_summary.csv');

  return data.map(row => ({
    field: row.field_of_study,
    employmentRate2023: parseFloat(row.employed_pct_2023) || null,
    employmentRate2024: parseFloat(row.employed_pct_2024) || null,
    employmentChange: parseFloat(row.employment_change) || null,
    totalGrads2023: parseInt(row.total_grads_2023) || null,
    totalGrads2024: parseInt(row.total_grads_2024) || null,
    graduateGrowth: parseInt(row.graduate_growth) || null
  }));
}

/**
 * Process master dataset for trends
 */
function processMasterDataset() {
  console.log('Processing master dataset...');

  const data = parseCSV('data/PDF_EXTRACTS/master_state_education_employment.csv');

  const byState = {};

  data.forEach(row => {
    const stateName = STATE_NAME_MAP[row.state] || row.state;
    const year = parseInt(row.year);

    if (!byState[stateName]) {
      byState[stateName] = {};
    }

    byState[stateName][year] = {
      year,
      totalGraduates: parseInt(row.total_graduates_produced) || null,
      maleGraduates: parseInt(row.male_graduates) || null,
      femaleGraduates: parseInt(row.female_graduates) || null,
      employmentRate: parseFloat(row.employed_pct) || null,
      unemploymentRate: parseFloat(row.unemployed_pct) || null
    };
  });

  return byState;
}

/**
 * Main processing function
 */
function main() {
  console.log('='.repeat(80));
  console.log('PROCESSING PDF DATA FOR DASHBOARD');
  console.log('='.repeat(80));
  console.log();

  try {
    // Process state snapshot
    const stateSnapshot = processStateSnapshot();
    fs.writeFileSync(
      'src/data/graduates/graduate-employment-by-state-2024.json',
      JSON.stringify(stateSnapshot, null, 2)
    );
    console.log('✓ Created: src/data/graduates/graduate-employment-by-state-2024.json');

    // Process field analysis
    const fieldAnalysis = processFieldAnalysis();
    fs.writeFileSync(
      'src/data/graduates/employment-by-field.json',
      JSON.stringify(fieldAnalysis, null, 2)
    );
    console.log('✓ Created: src/data/graduates/employment-by-field.json');

    // Process master dataset
    const masterData = processMasterDataset();
    fs.writeFileSync(
      'src/data/graduates/graduate-trends-by-state.json',
      JSON.stringify(masterData, null, 2)
    );
    console.log('✓ Created: src/data/graduates/graduate-trends-by-state.json');

    console.log();
    console.log('='.repeat(80));
    console.log('SUCCESS! PDF data processed and ready for dashboard');
    console.log('='.repeat(80));
    console.log();
    console.log('Next steps:');
    console.log('  1. Update MalaysiaMap.jsx to include graduate employment metric');
    console.log('  2. Add graduate employment cards to index.astro');
    console.log('  3. Test the map with new data');

  } catch (error) {
    console.error('Error processing data:', error);
    process.exit(1);
  }
}

main();
