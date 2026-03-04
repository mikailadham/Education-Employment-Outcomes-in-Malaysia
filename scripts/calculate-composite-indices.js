import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the summary data
const summaryData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/summary-by-state.json'), 'utf-8')
);

// Load education infrastructure data (will be created by another script)
let educationInfraData = {};
const infraPath = path.join(__dirname, '../src/data/education/infrastructure-by-state.json');
if (fs.existsSync(infraPath)) {
  educationInfraData = JSON.parse(fs.readFileSync(infraPath, 'utf-8'));
}

// Load graduate data
let graduateData = {};
const gradPath = path.join(__dirname, '../src/data/graduates/summary-by-state.json');
if (fs.existsSync(gradPath)) {
  graduateData = JSON.parse(fs.readFileSync(gradPath, 'utf-8'));
}

// Calculate population estimate from labour force
function estimatePopulation(labourForce, participationRate) {
  if (!labourForce || !participationRate) return null;
  return (labourForce / participationRate) * 100;
}

// Normalize value to 0-100 scale (higher is better)
function normalize(value, min, max, inverse = false) {
  if (value === null || value === undefined) return null;
  const normalized = ((value - min) / (max - min)) * 100;
  return inverse ? 100 - normalized : normalized;
}

// Calculate composite indices for each state
function calculateCompositeIndices() {
  const states = Object.keys(summaryData);
  const results = {};

  // First pass: collect all values for normalization
  const values = {
    completion_rate: [],
    participation_rate: [],
    employment_rate: [],
    unemployment_rate: [],
    mean_income: [],
    gdp_total: [],
    schools_per_100k: [],
    student_teacher_ratio: [],
    mywi_education: [],
    mywi_economic: []
  };

  states.forEach(state => {
    const data = summaryData[state];
    if (!data) return;

    values.completion_rate.push(data.school_completion_rate || 0);
    values.participation_rate.push(data.participation_rate || 0);

    // Calculate employment rate
    if (data.employed && data.labour_force) {
      const employmentRate = (data.employed / data.labour_force) * 100;
      values.employment_rate.push(employmentRate);
    }

    values.unemployment_rate.push(data.unemployment_rate || 0);
    values.mean_income.push(data.mean_income || 0);
    values.gdp_total.push(data.gdp_total || 0);
    values.mywi_education.push(data.mywi_education || 0);
    values.mywi_economic.push(data.mywi_economic || 0);

    // Add infrastructure metrics if available
    if (educationInfraData[state]) {
      const infraData = educationInfraData[state];
      if (infraData.schools_per_100k) {
        values.schools_per_100k.push(infraData.schools_per_100k);
      }
      if (infraData.student_teacher_ratio) {
        values.student_teacher_ratio.push(infraData.student_teacher_ratio);
      }
    }
  });

  // Calculate min/max for normalization
  const ranges = {};
  Object.keys(values).forEach(key => {
    const arr = values[key].filter(v => v !== null && v !== undefined && !isNaN(v));
    if (arr.length > 0) {
      ranges[key] = {
        min: Math.min(...arr),
        max: Math.max(...arr)
      };
    }
  });

  // Second pass: calculate indices
  states.forEach(state => {
    const data = summaryData[state];
    if (!data) return;

    const infraData = educationInfraData[state] || {};
    const gradData = graduateData[state] || {};

    // Calculate employment rate
    let employmentRate = null;
    if (data.employed && data.labour_force) {
      employmentRate = (data.employed / data.labour_force) * 100;
    }

    // Education Supply Index (ESI)
    // Components: completion rate, schools per capita, student-teacher ratio, MyWI education
    const esiComponents = [];

    if (data.school_completion_rate && ranges.completion_rate) {
      esiComponents.push({
        value: normalize(data.school_completion_rate, ranges.completion_rate.min, ranges.completion_rate.max),
        weight: 0.3
      });
    }

    if (infraData.schools_per_100k && ranges.schools_per_100k) {
      esiComponents.push({
        value: normalize(infraData.schools_per_100k, ranges.schools_per_100k.min, ranges.schools_per_100k.max),
        weight: 0.2
      });
    }

    if (infraData.student_teacher_ratio && ranges.student_teacher_ratio) {
      // Lower ratio is better, so inverse normalization
      esiComponents.push({
        value: normalize(infraData.student_teacher_ratio, ranges.student_teacher_ratio.min, ranges.student_teacher_ratio.max, true),
        weight: 0.2
      });
    }

    if (data.mywi_education && ranges.mywi_education) {
      esiComponents.push({
        value: normalize(data.mywi_education, ranges.mywi_education.min, ranges.mywi_education.max),
        weight: 0.3
      });
    }

    // Calculate weighted ESI
    const totalWeight = esiComponents.reduce((sum, c) => sum + c.weight, 0);
    const esi = totalWeight > 0
      ? esiComponents.reduce((sum, c) => sum + c.value * c.weight, 0) / totalWeight
      : null;

    // Employment Outcome Index (EOI)
    // Components: employment rate, LFPR, mean income, unemployment rate (inverse), MyWI economic
    const eoiComponents = [];

    if (employmentRate && ranges.employment_rate) {
      eoiComponents.push({
        value: normalize(employmentRate, ranges.employment_rate.min, ranges.employment_rate.max),
        weight: 0.25
      });
    }

    if (data.participation_rate && ranges.participation_rate) {
      eoiComponents.push({
        value: normalize(data.participation_rate, ranges.participation_rate.min, ranges.participation_rate.max),
        weight: 0.2
      });
    }

    if (data.mean_income && ranges.mean_income) {
      eoiComponents.push({
        value: normalize(data.mean_income, ranges.mean_income.min, ranges.mean_income.max),
        weight: 0.25
      });
    }

    if (data.unemployment_rate !== null && data.unemployment_rate !== undefined && ranges.unemployment_rate) {
      // Lower unemployment is better, so inverse normalization
      eoiComponents.push({
        value: normalize(data.unemployment_rate, ranges.unemployment_rate.min, ranges.unemployment_rate.max, true),
        weight: 0.15
      });
    }

    if (data.mywi_economic && ranges.mywi_economic) {
      eoiComponents.push({
        value: normalize(data.mywi_economic, ranges.mywi_economic.min, ranges.mywi_economic.max),
        weight: 0.15
      });
    }

    // Calculate weighted EOI
    const eoiTotalWeight = eoiComponents.reduce((sum, c) => sum + c.weight, 0);
    const eoi = eoiTotalWeight > 0
      ? eoiComponents.reduce((sum, c) => sum + c.value * c.weight, 0) / eoiTotalWeight
      : null;

    // Education-Employment Alignment Index (EEAI)
    // Simple average of ESI and EOI if both available
    const eeai = esi !== null && eoi !== null ? (esi + eoi) / 2 : null;

    // Estimate population
    const estimatedPopulation = estimatePopulation(data.labour_force, data.participation_rate);

    // Calculate GDP per capita
    let gdpPerCapita = null;
    if (data.gdp_total && estimatedPopulation) {
      // GDP is in billions RM, population is in thousands
      gdpPerCapita = (data.gdp_total * 1000000) / (estimatedPopulation * 1000);
    }

    results[state] = {
      state,

      // Composite indices
      education_supply_index: esi !== null ? Math.round(esi * 10) / 10 : null,
      employment_outcome_index: eoi !== null ? Math.round(eoi * 10) / 10 : null,
      eeai: eeai !== null ? Math.round(eeai * 10) / 10 : null,

      // Raw metrics for reference
      school_completion_rate: data.school_completion_rate || null,
      schools_per_100k: infraData.schools_per_100k || null,
      student_teacher_ratio: infraData.student_teacher_ratio || null,
      employment_rate: employmentRate !== null ? Math.round(employmentRate * 10) / 10 : null,
      participation_rate: data.participation_rate || null,
      unemployment_rate: data.unemployment_rate || null,
      mean_income: data.mean_income || null,
      gdp_per_capita: gdpPerCapita !== null ? Math.round(gdpPerCapita) : null,
      gdp_total: data.gdp_total || null,

      // MyWI components
      mywi_education: data.mywi_education || null,
      mywi_economic: data.mywi_economic || null,
      mywi_overall: data.mywi_overall || null,

      // Graduate data if available
      graduate_employment_rate: gradData.employment_rate || null,

      // Population estimate
      estimated_population: estimatedPopulation !== null ? Math.round(estimatedPopulation) : null,

      // Year references
      lfs_year: data.lfs_year || null,
      income_year: data.income_year || null,
      completion_year: data.completion_year || null,
      gdp_year: data.gdp_year || null
    };
  });

  return results;
}

// Main execution
console.log('Calculating composite indices...');
const indices = calculateCompositeIndices();

// Create output directory
const outputDir = path.join(__dirname, '../src/data/analytics');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created analytics directory');
}

// Write output
const outputPath = path.join(outputDir, 'composite-indices.json');
fs.writeFileSync(outputPath, JSON.stringify(indices, null, 2));

console.log(`✓ Composite indices calculated for ${Object.keys(indices).length} states`);
console.log(`✓ Output written to: ${outputPath}`);

// Print summary statistics
const esiValues = Object.values(indices).map(s => s.education_supply_index).filter(v => v !== null);
const eoiValues = Object.values(indices).map(s => s.employment_outcome_index).filter(v => v !== null);
const eeaiValues = Object.values(indices).map(s => s.eeai).filter(v => v !== null);

if (esiValues.length > 0) {
  console.log(`\nEducation Supply Index (ESI):`);
  console.log(`  Range: ${Math.min(...esiValues).toFixed(1)} - ${Math.max(...esiValues).toFixed(1)}`);
  console.log(`  Mean: ${(esiValues.reduce((a, b) => a + b, 0) / esiValues.length).toFixed(1)}`);
}

if (eoiValues.length > 0) {
  console.log(`\nEmployment Outcome Index (EOI):`);
  console.log(`  Range: ${Math.min(...eoiValues).toFixed(1)} - ${Math.max(...eoiValues).toFixed(1)}`);
  console.log(`  Mean: ${(eoiValues.reduce((a, b) => a + b, 0) / eoiValues.length).toFixed(1)}`);
}

if (eeaiValues.length > 0) {
  console.log(`\nEducation-Employment Alignment Index (EEAI):`);
  console.log(`  Range: ${Math.min(...eeaiValues).toFixed(1)} - ${Math.max(...eeaiValues).toFixed(1)}`);
  console.log(`  Mean: ${(eeaiValues.reduce((a, b) => a + b, 0) / eeaiValues.length).toFixed(1)}`);
}
