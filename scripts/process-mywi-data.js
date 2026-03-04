/**
 * Process MyWI (Malaysian Well-Being Index) Data
 * Integrates MyWI data with existing summary-by-state.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const SRC_DATA_DIR = path.join(__dirname, '..', 'src', 'data');
const MYWI_FILE = path.join(DATA_DIR, 'WELLBEING', 'mywi_state_wide_2010_2024.csv');
const SUMMARY_FILE = path.join(SRC_DATA_DIR, 'summary-by-state.json');
const OUTPUT_DIR = path.join(SRC_DATA_DIR, 'wellbeing');

// State name mapping
// MyWI uses "Wilayah Persekutuan" for all 3 FTs combined
// We need to map this to individual FT entries
const STATE_NAME_MAP = {
  'Johor': 'Johor',
  'Kedah': 'Kedah',
  'Kelantan': 'Kelantan',
  'Melaka': 'Melaka',
  'Negeri Sembilan': 'Negeri Sembilan',
  'Pahang': 'Pahang',
  'Perak': 'Perak',
  'Perlis': 'Perlis',
  'Pulau Pinang': 'Pulau Pinang',
  'Sabah': 'Sabah',
  'Sarawak': 'Sarawak',
  'Selangor': 'Selangor',
  'Terengganu': 'Terengganu',
  'Wilayah Persekutuan': 'W.P.' // Will be replicated to KL, Putrajaya, Labuan
};

/**
 * Parse CSV file
 */
function parseCSV(content) {
  const lines = content.trim().split('\n');
  const headers = lines[0].split(',').map(h => h.trim());

  return lines.slice(1).map(line => {
    const values = line.split(',').map(v => v.trim());
    const row = {};
    headers.forEach((header, i) => {
      const value = values[i];
      // Convert to number if it looks like a number
      row[header] = isNaN(value) || value === '' ? value : parseFloat(value);
    });
    return row;
  });
}

/**
 * Process MyWI data
 */
function processMyWIData() {
  console.log('[INFO] Reading MyWI data from:', MYWI_FILE);

  const content = fs.readFileSync(MYWI_FILE, 'utf-8');
  const data = parseCSV(content);

  console.log(`[SUCCESS] Parsed ${data.length} rows`);
  console.log('[INFO] Sample row:', data[0]);

  // Organize by state and year
  const byState = {};
  const byYear = {};

  data.forEach(row => {
    const state = row.state;
    const year = row.year;

    // Initialize state if not exists
    if (!byState[state]) {
      byState[state] = {};
    }

    // Initialize year if not exists
    if (!byYear[year]) {
      byYear[year] = {};
    }

    // Store all MyWI metrics for this state-year
    byState[state][year] = {
      overall: row['MyWI Overall'],
      economic: row.Economic,
      social: row.Social,
      environmental: row.Environmental,
      components: {
        transportation: row.Transportation,
        communication: row.Communication,
        income_distribution: row['Income and Distribution'],
        working_life: row['Working Life'],
        education: row.Education,
        housing: row.Housing,
        entertainment: row['Entertainment and Recreation'],
        public_safety: row['Public Safety'],
        social_participation: row['Social Participation'],
        governance: row.Governance,
        culture: row.Culture,
        health: row.Health,
        family: row.Family,
        air: row.Air,
        water: row.Water,
        biodiversity: row['Biodiversity Resources']
      }
    };

    byYear[year][state] = byState[state][year];
  });

  console.log(`[SUCCESS] Processed data for ${Object.keys(byState).length} states`);
  console.log(`[INFO] Years available: ${Object.keys(byYear).sort().join(', ')}`);

  return { byState, byYear };
}

/**
 * Get latest year data for each state
 */
function getLatestYearData(byState) {
  const latest = {};
  const latestYear = 2024;

  Object.keys(byState).forEach(state => {
    const stateData = byState[state];
    const years = Object.keys(stateData).map(Number).sort((a, b) => b - a);
    const mostRecentYear = years[0];

    latest[state] = {
      ...stateData[mostRecentYear],
      year: mostRecentYear
    };
  });

  console.log(`[SUCCESS] Extracted latest year data (${latestYear}) for ${Object.keys(latest).length} states`);
  return latest;
}

/**
 * Merge MyWI data with existing summary
 */
function mergeWithExistingSummary(latestMyWI) {
  // Read existing summary
  let existingSummary = {};
  if (fs.existsSync(SUMMARY_FILE)) {
    existingSummary = JSON.parse(fs.readFileSync(SUMMARY_FILE, 'utf-8'));
    console.log(`[INFO] Loaded existing summary with ${Object.keys(existingSummary).length} states`);
  } else {
    console.log('[WARN] No existing summary found, creating new one');
  }

  // Merge MyWI data into summary
  const merged = { ...existingSummary };

  Object.keys(latestMyWI).forEach(state => {
    const mappedState = STATE_NAME_MAP[state];

    if (!mappedState) {
      console.log(`[WARN] No mapping found for state: ${state}`);
      return;
    }

    // Handle Wilayah Persekutuan - apply to all 3 FTs
    if (mappedState === 'W.P.') {
      const wpData = latestMyWI[state];
      ['W.P. Kuala Lumpur', 'W.P. Putrajaya', 'W.P. Labuan'].forEach(ft => {
        if (!merged[ft]) merged[ft] = {};
        merged[ft] = {
          ...merged[ft],
          mywi_overall: wpData.overall,
          mywi_economic: wpData.economic,
          mywi_social: wpData.social,
          mywi_environmental: wpData.environmental,
          mywi_transportation: wpData.components.transportation,
          mywi_communication: wpData.components.communication,
          mywi_income_distribution: wpData.components.income_distribution,
          mywi_working_life: wpData.components.working_life,
          mywi_education: wpData.components.education,
          mywi_housing: wpData.components.housing,
          mywi_entertainment: wpData.components.entertainment,
          mywi_public_safety: wpData.components.public_safety,
          mywi_social_participation: wpData.components.social_participation,
          mywi_governance: wpData.components.governance,
          mywi_culture: wpData.components.culture,
          mywi_health: wpData.components.health,
          mywi_family: wpData.components.family,
          mywi_air: wpData.components.air,
          mywi_water: wpData.components.water,
          mywi_biodiversity: wpData.components.biodiversity,
          mywi_year: wpData.year
        };
      });
    } else {
      // Regular state
      if (!merged[mappedState]) merged[mappedState] = {};
      const stateData = latestMyWI[state];
      merged[mappedState] = {
        ...merged[mappedState],
        mywi_overall: stateData.overall,
        mywi_economic: stateData.economic,
        mywi_social: stateData.social,
        mywi_environmental: stateData.environmental,
        mywi_transportation: stateData.components.transportation,
        mywi_communication: stateData.components.communication,
        mywi_income_distribution: stateData.components.income_distribution,
        mywi_working_life: stateData.components.working_life,
        mywi_education: stateData.components.education,
        mywi_housing: stateData.components.housing,
        mywi_entertainment: stateData.components.entertainment,
        mywi_public_safety: stateData.components.public_safety,
        mywi_social_participation: stateData.components.social_participation,
        mywi_governance: stateData.components.governance,
        mywi_culture: stateData.components.culture,
        mywi_health: stateData.components.health,
        mywi_family: stateData.components.family,
        mywi_air: stateData.components.air,
        mywi_water: stateData.components.water,
        mywi_biodiversity: stateData.components.biodiversity,
        mywi_year: stateData.year
      };
    }
  });

  console.log(`[SUCCESS] Merged MyWI data into summary for ${Object.keys(merged).length} states`);
  return merged;
}

/**
 * Main execution
 */
function main() {
  console.log('=== MyWI Data Processing Script ===\n');

  try {
    // Process MyWI data
    const { byState, byYear } = processMyWIData();

    // Get latest year data
    const latestMyWI = getLatestYearData(byState);

    // Merge with existing summary
    const mergedSummary = mergeWithExistingSummary(latestMyWI);

    // Ensure output directories exist
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    // Write outputs
    console.log('\n[INFO] Writing output files...');

    // 1. Updated summary-by-state.json (with MyWI data)
    fs.writeFileSync(SUMMARY_FILE, JSON.stringify(mergedSummary, null, 2));
    console.log('[SUCCESS] Updated:', SUMMARY_FILE);

    // 2. MyWI by state (all years)
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'mywi-by-state.json'),
      JSON.stringify(byState, null, 2)
    );
    console.log('[SUCCESS] Created: wellbeing/mywi-by-state.json');

    // 3. MyWI by year (for national trends)
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'mywi-by-year.json'),
      JSON.stringify(byYear, null, 2)
    );
    console.log('[SUCCESS] Created: wellbeing/mywi-by-year.json');

    // 4. Latest year snapshot
    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'mywi-latest.json'),
      JSON.stringify(latestMyWI, null, 2)
    );
    console.log('[SUCCESS] Created: wellbeing/mywi-latest.json');

    console.log('\n=== Processing Complete ===');
    console.log(`\nMyWI data integrated into summary-by-state.json`);
    console.log(`States available: ${Object.keys(mergedSummary).length}`);
    console.log(`MyWI metrics added: overall, economic, social, environmental + 16 components`);

  } catch (error) {
    console.error('[ERROR] Processing failed:', error);
    process.exit(1);
  }
}

main();
