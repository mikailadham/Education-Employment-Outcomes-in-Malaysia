/**
 * Process Graduate Tracer Study (GTS) data from 7 CSV files
 * Outputs a single consolidated JSON file for visualization
 */

import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '..', 'data', 'GRADUATES_STATISTICS');
const OUTPUT_DIR = path.join(__dirname, '..', 'src', 'data', 'GRADUATES_STATISTICS');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'graduate-tracer-processed.json');

// Helper to read CSV
function readCSV(filename) {
  const filePath = path.join(DATA_DIR, filename);
  const content = fs.readFileSync(filePath, 'utf-8');
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  });
}

// Helper to parse number (handles empty strings and asterisks)
function parseNumber(value) {
  if (!value || value === '' || value.includes('*')) return null;
  const num = parseFloat(value);
  return isNaN(num) ? null : num;
}

// Process GTS_01: National Totals
function processNationalTotals() {
  const records = readCSV('GTS_01_National_Totals.csv');

  return records.map(record => {
    const year = parseInt(record.Year);
    const is2024 = year === 2024;

    return {
      year,
      totalTracked: parseInt(record.Total_Tracked),
      employed: {
        n: parseInt(record.Employed_N || 0),
        pct: parseFloat(record.Employed_Pct || 0)
      },
      furtherStudy: {
        n: parseInt(record.Further_Study_N || 0),
        pct: parseFloat(record.Further_Study_Pct || 0)
      },
      upgradingSkills: {
        n: parseInt(record.Upgrading_Skills_N || 0),
        pct: parseFloat(record.Upgrading_Skills_Pct || 0)
      },
      waitingPlacement: {
        n: parseInt(record.Waiting_Placement_N || 0),
        pct: parseFloat(record.Waiting_Placement_Pct || 0)
      },
      unemployed: {
        n: parseInt(record.Unemployed_N || 0),
        pct: parseFloat(record.Unemployed_Pct || 0)
      },
      methodologyChange: is2024,
      notes: record.Notes
    };
  });
}

// Process GTS_02: Field of Study
function processByField() {
  const records = readCSV('GTS_02_Field_of_Study.csv');

  return records
    .filter(record => record.Field_of_Study !== 'NATIONAL TOTAL')
    .map(record => {
      const field = record.Field_of_Study;

      return {
        field,
        unemploymentByYear: {
          2020: { pct: parseNumber(record.Unemployed_Pct_2020), total: parseNumber(record.Total_N_2020), hasAsterisk: record.Unemployed_Pct_2020?.includes('*') },
          2021: { pct: parseNumber(record.Unemployed_Pct_2021), total: parseNumber(record.Total_N_2021), hasAsterisk: record.Unemployed_Pct_2021?.includes('*') },
          2022: { pct: parseNumber(record.Unemployed_Pct_2022), total: parseNumber(record.Total_N_2022) },
          2023: { pct: parseNumber(record.Unemployed_Pct_2023), total: parseNumber(record.Total_N_2023) },
          2024: { pct: parseNumber(record.Unemployed_Pct_2024), total: parseNumber(record.Total_N_2024), methodologyChange: true }
        },
        notes: record.Notes
      };
    });
}

// Process GTS_03: State Level
function processByState() {
  const records = readCSV('GTS_03_State_Level.csv');

  return records
    .filter(record => record.State !== 'NATIONAL' && record.State !== 'Luar Negara (Overseas)')
    .map(record => {
      const state = record.State;

      return {
        state,
        avgUnemployment: parseFloat(record.Avg_2020_2024),
        rank2024: parseInt(record.Rank_2024 || 0),
        unemploymentByYear: {
          2020: { pct: parseFloat(record.Unemployed_Pct_2020), total: parseInt(record.Total_N_2020) },
          2021: { pct: parseFloat(record.Unemployed_Pct_2021), total: parseInt(record.Total_N_2021) },
          2022: { pct: parseFloat(record.Unemployed_Pct_2022), total: parseInt(record.Total_N_2022) },
          2023: { pct: parseFloat(record.Unemployed_Pct_2023), total: parseInt(record.Total_N_2023) },
          2024: { pct: parseFloat(record.Unemployed_Pct_2024), total: parseInt(record.Total_N_2024), methodologyChange: true }
        }
      };
    });
}

// Process GTS_04: Institution Type
function processByInstitution() {
  const records = readCSV('GTS_04_Institution_Type.csv');

  return records
    .filter(record => record.Institution_Type !== 'NATIONAL TOTAL')
    .map(record => {
      const type = record.Institution_Type;

      return {
        type,
        unemploymentByYear: {
          2020: { pct: parseFloat(record.Unemployed_Pct_2020), total: parseInt(record.Total_N_2020) },
          2021: { pct: parseFloat(record.Unemployed_Pct_2021), total: parseInt(record.Total_N_2021) },
          2022: { pct: parseFloat(record.Unemployed_Pct_2022), total: parseInt(record.Total_N_2022) },
          2023: { pct: parseFloat(record.Unemployed_Pct_2023), total: parseInt(record.Total_N_2023) },
          2024: { pct: parseFloat(record.Unemployed_Pct_2024), total: parseInt(record.Total_N_2024), methodologyChange: true }
        }
      };
    });
}

// Process GTS_05: Level of Study (not used in components but included for completeness)
function processByLevel() {
  const records = readCSV('GTS_05_Level_of_Study.csv');

  return records
    .filter(record => record.Level_of_Study !== 'NATIONAL TOTAL')
    .map(record => {
      const level = record.Level_of_Study;

      return {
        level,
        unemploymentByYear: {
          2020: { pct: parseFloat(record.Unemployed_Pct_2020 || 0), total: parseInt(record.Total_N_2020 || 0) },
          2021: { pct: parseFloat(record.Unemployed_Pct_2021 || 0), total: parseInt(record.Total_N_2021 || 0) },
          2022: { pct: parseFloat(record.Unemployed_Pct_2022 || 0), total: parseInt(record.Total_N_2022 || 0) },
          2023: { pct: parseFloat(record.Unemployed_Pct_2023 || 0), total: parseInt(record.Total_N_2023 || 0) },
          2024: { pct: parseFloat(record.Unemployed_Pct_2024 || 0), total: parseInt(record.Total_N_2024 || 0), methodologyChange: true }
        }
      };
    });
}

// Process GTS_06: Public vs Private Gap
function processPublicPrivateGap() {
  const records = readCSV('GTS_06_Public_vs_Private_Gap.csv');

  return records.map(record => {
    const year = parseInt(record.Year);
    const is2024 = year === 2024;

    return {
      year,
      publicUniversity: parseFloat(record.Public_Univ_Unemployed_Pct),
      privateHEI: parseFloat(record.Private_HEI_Unemployed_Pct),
      gap: parseFloat(record.Gap_Percentage_Points),
      multiplier: record.Private_vs_Public_Multiplier,
      methodologyChange: is2024
    };
  });
}

// Process GTS_07: Key States Longitudinal
function processKeyStatesLongitudinal() {
  const records = readCSV('GTS_07_Key_States_Longitudinal.csv');

  const stateData = {};

  records.forEach(record => {
    const state = record.State;
    const year = parseInt(record.Year);

    if (!stateData[state]) {
      stateData[state] = [];
    }

    stateData[state].push({
      year,
      employed: parseInt(record.Employed_N),
      unemployed: parseInt(record.Unemployed_N),
      unemployedPct: parseFloat(record.Unemployed_Pct),
      total: parseInt(record.Total_N),
      rank: parseInt(record.Rank_That_Year),
      methodologyChange: year === 2024
    });
  });

  return stateData;
}

// Main processing function
function processAllData() {
  console.log('Processing Graduate Tracer Study data...');

  const output = {
    nationalTotals: processNationalTotals(),
    byField: processByField(),
    byState: processByState(),
    byInstitution: processByInstitution(),
    byLevel: processByLevel(),
    publicPrivateGap: processPublicPrivateGap(),
    keyStatesLongitudinal: processKeyStatesLongitudinal(),
    metadata: {
      processedDate: new Date().toISOString(),
      years: [2020, 2021, 2022, 2023, 2024],
      methodologyNote: '2024 uses binary GE rate (Employed vs Not Working Yet) - not directly comparable to 2020-2023',
      sourceFiles: [
        'GTS_01_National_Totals.csv',
        'GTS_02_Field_of_Study.csv',
        'GTS_03_State_Level.csv',
        'GTS_04_Institution_Type.csv',
        'GTS_05_Level_of_Study.csv',
        'GTS_06_Public_vs_Private_Gap.csv',
        'GTS_07_Key_States_Longitudinal.csv'
      ]
    }
  };

  // Ensure output directory exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  // Write output
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

  console.log('✅ Graduate Tracer Study data processed successfully!');
  console.log(`   Output: ${OUTPUT_FILE}`);
  console.log(`   National totals: ${output.nationalTotals.length} years`);
  console.log(`   Fields: ${output.byField.length} categories`);
  console.log(`   States: ${output.byState.length} states/territories`);
  console.log(`   Institution types: ${output.byInstitution.length} categories`);
  console.log(`   Public-Private gap: ${output.publicPrivateGap.length} years`);
}

// Run
processAllData();
