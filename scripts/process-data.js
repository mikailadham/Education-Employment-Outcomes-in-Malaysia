import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const OUTPUT_DIR = path.join(ROOT_DIR, 'src', 'data');

// Canonical state names for standardization
const STATE_MAPPING = {
  'johor': 'Johor',
  'kedah': 'Kedah',
  'kelantan': 'Kelantan',
  'melaka': 'Melaka',
  'malacca': 'Melaka',
  'negeri sembilan': 'Negeri Sembilan',
  'n. sembilan': 'Negeri Sembilan',
  'n sembilan': 'Negeri Sembilan',
  'pahang': 'Pahang',
  'perak': 'Perak',
  'perlis': 'Perlis',
  'pulau pinang': 'Pulau Pinang',
  'penang': 'Pulau Pinang',
  'p. pinang': 'Pulau Pinang',
  'pinang': 'Pulau Pinang',
  'sabah': 'Sabah',
  'sarawak': 'Sarawak',
  'selangor': 'Selangor',
  'terengganu': 'Terengganu',
  'trengganu': 'Terengganu',
  'w.p. kuala lumpur': 'W.P. Kuala Lumpur',
  'wp kuala lumpur': 'W.P. Kuala Lumpur',
  'kuala lumpur': 'W.P. Kuala Lumpur',
  'kl': 'W.P. Kuala Lumpur',
  'w.p. putrajaya': 'W.P. Putrajaya',
  'wp putrajaya': 'W.P. Putrajaya',
  'putrajaya': 'W.P. Putrajaya',
  'w.p. labuan': 'W.P. Labuan',
  'wp labuan': 'W.P. Labuan',
  'labuan': 'W.P. Labuan'
};

// Utility functions
function standardizeState(stateName) {
  if (!stateName || typeof stateName !== 'string') return null;
  const cleaned = stateName.toLowerCase().trim();
  return STATE_MAPPING[cleaned] || stateName.trim();
}

function parseNumeric(value) {
  if (value === null || value === undefined || value === '') return null;
  if (typeof value === 'number') return value;
  const num = parseFloat(value.toString().replace(/,/g, ''));
  return isNaN(num) ? null : num;
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// Phase 1: Discovery - Find all CSV files and identify duplicates
function discoverCSVFiles() {
  console.log('\n========================================');
  console.log('PHASE 1: DATA DISCOVERY');
  console.log('========================================\n');

  const csvFiles = [];
  const folders = ['ANNUAL_LFS', 'ECONOMIC_CONTEXT', 'EDUCATION', 'LABOUR_PRODUCTIVITY', 'MONTHLY_SERIES', 'QUARTERLY_SERIES'];

  folders.forEach(folder => {
    const folderPath = path.join(DATA_DIR, folder);
    if (!fs.existsSync(folderPath)) return;

    const files = fs.readdirSync(folderPath);
    files.forEach(file => {
      if (file.endsWith('.csv')) {
        csvFiles.push({
          folder,
          filename: file,
          fullPath: path.join(folderPath, file),
          isDuplicate: /\(\d+\)\.csv$/.test(file),
          baseName: file.replace(/\s*\(\d+\)\.csv$/, '.csv')
        });
      }
    });
  });

  console.log(`Found ${csvFiles.length} CSV files\n`);

  // Group by base name to identify duplicates
  const fileGroups = {};
  csvFiles.forEach(file => {
    const key = `${file.folder}/${file.baseName}`;
    if (!fileGroups[key]) fileGroups[key] = [];
    fileGroups[key].push(file);
  });

  // Select files to process (prefer non-duplicate versions)
  const filesToProcess = [];
  const filesToSkip = [];

  Object.entries(fileGroups).forEach(([key, files]) => {
    if (files.length === 1) {
      filesToProcess.push(files[0]);
    } else {
      // Find the original (non-duplicate) version
      const original = files.find(f => !f.isDuplicate);
      if (original) {
        filesToProcess.push(original);
        filesToSkip.push(...files.filter(f => f.isDuplicate));
      } else {
        // All are duplicates - keep the one without number or highest number
        const sorted = files.sort((a, b) => {
          const numA = (a.filename.match(/\((\d+)\)/) || [0, 0])[1];
          const numB = (b.filename.match(/\((\d+)\)/) || [0, 0])[1];
          return parseInt(numB) - parseInt(numA);
        });
        filesToProcess.push(sorted[0]);
        filesToSkip.push(...sorted.slice(1));
      }
    }
  });

  console.log(`Files to process: ${filesToProcess.length}`);
  console.log(`Files to skip (duplicates): ${filesToSkip.length}\n`);

  if (filesToSkip.length > 0) {
    console.log('Skipping duplicates:');
    filesToSkip.forEach(f => console.log(`  - ${f.folder}/${f.filename}`));
    console.log('');
  }

  return filesToProcess;
}

// Phase 2: Analyze CSV structure
function analyzeCSV(file) {
  const content = fs.readFileSync(file.fullPath, 'utf-8');
  const result = Papa.parse(content, { header: true, skipEmptyLines: true });

  const data = result.data;
  const columns = result.meta.fields || [];

  return {
    ...file,
    rowCount: data.length,
    columns,
    sampleRow: data[0] || {},
    data
  };
}

// Phase 3: Process and transform data
async function processAllData() {
  console.log('\n========================================');
  console.log('PHASE 2 & 3: PROCESSING & TRANSFORMATION');
  console.log('========================================\n');

  const files = discoverCSVFiles();

  // Ensure output directories exist
  ensureDir(OUTPUT_DIR);
  ensureDir(path.join(OUTPUT_DIR, 'economic'));
  ensureDir(path.join(OUTPUT_DIR, 'labour'));
  ensureDir(path.join(OUTPUT_DIR, 'education'));

  // Analyze all files
  const analyzedFiles = files.map(analyzeCSV);

  // Log file structures
  console.log('File structures:');
  analyzedFiles.forEach(file => {
    console.log(`\n${file.folder}/${file.filename}`);
    console.log(`  Rows: ${file.rowCount}`);
    console.log(`  Columns: ${file.columns.join(', ')}`);
  });

  // Process each category
  await processEconomicData(analyzedFiles);
  await processLabourData(analyzedFiles);
  await processEducationData(analyzedFiles);
  await createStateSummary(analyzedFiles);

  console.log('\n========================================');
  console.log('PROCESSING COMPLETE!');
  console.log('========================================\n');
  console.log(`Output files created in: ${OUTPUT_DIR}`);
}

// Process Economic Context data
async function processEconomicData(files) {
  console.log('\n--- Processing Economic Data ---');

  // GDP by state
  const gdpFile = files.find(f => f.filename.includes('gdp_state_real_supply'));
  if (gdpFile) {
    const sectorNames = {
      'p0': 'Total',
      'p1': 'Agriculture, forestry & fishing',
      'p2': 'Mining & quarrying',
      'p3': 'Manufacturing',
      'p4': 'Construction',
      'p5': 'Services'
    };

    const gdpByState = {};
    gdpFile.data.forEach(row => {
      const state = standardizeState(row.state);
      if (!state || state === 'Supranational') return;

      const year = parseInt(row.date?.split('-')[0]);
      if (!year) return;

      if (!gdpByState[state]) gdpByState[state] = {};
      if (!gdpByState[state][year]) gdpByState[state][year] = {};

      const sectorCode = row.sector;
      const sectorName = sectorNames[sectorCode] || sectorCode;
      const value = parseNumeric(row.value);
      if (value !== null) {
        gdpByState[state][year][sectorName] = value;
      }
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'economic', 'gdp-by-state.json'),
      JSON.stringify(gdpByState, null, 2)
    );
    console.log('✓ Created economic/gdp-by-state.json');
  }

  // Household income by state
  const incomeFile = files.find(f => f.filename.includes('hh_income_state') && !f.filename.includes('percentile'));
  if (incomeFile) {
    const incomeByState = {};
    incomeFile.data.forEach(row => {
      const state = standardizeState(row.state);
      if (!state) return;

      const year = parseInt(row.date);
      if (!year) return;

      if (!incomeByState[state]) incomeByState[state] = {};
      incomeByState[state][year] = {
        mean: parseNumeric(row.income_mean),
        median: parseNumeric(row.income_median)
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'economic', 'household-income.json'),
      JSON.stringify(incomeByState, null, 2)
    );
    console.log('✓ Created economic/household-income.json');
  }

  // Gini coefficient
  const giniFile = files.find(f => f.filename.includes('hh_inequality_state'));
  if (giniFile) {
    const giniByState = {};
    giniFile.data.forEach(row => {
      const state = standardizeState(row.state);
      if (!state) return;

      const year = parseInt(row.date);
      if (!year) return;

      if (!giniByState[state]) giniByState[state] = {};
      giniByState[state][year] = parseNumeric(row.gini);
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'economic', 'gini-coefficient.json'),
      JSON.stringify(giniByState, null, 2)
    );
    console.log('✓ Created economic/gini-coefficient.json');
  }
}

// Process Labour Force data
async function processLabourData(files) {
  console.log('\n--- Processing Labour Data ---');

  // Annual LFS by state and sex
  const lfsStateSexFile = files.find(f => f.filename.includes('lfs_state_sex'));
  if (lfsStateSexFile) {
    const lfsByState = {};
    const lfsBySex = {};

    lfsStateSexFile.data.forEach(row => {
      const state = standardizeState(row.state);
      const sex = row.sex;
      const year = parseInt(row.date?.split('-')[0]);
      if (!state || !year) return;

      const metrics = {
        employed: parseNumeric(row.lf_employed),
        unemployed: parseNumeric(row.lf_unemployed),
        labour_force: parseNumeric(row.lf),
        outside_labour_force: parseNumeric(row.lf_outside),
        participation_rate: parseNumeric(row.p_rate),
        unemployment_rate: parseNumeric(row.u_rate),
        employment_ratio: parseNumeric(row.ep_ratio)
      };

      // By state (only for 'both' sex to avoid duplicates)
      if (sex === 'both') {
        if (!lfsByState[state]) lfsByState[state] = {};
        lfsByState[state][year] = metrics;
      }

      // By sex
      if (sex && sex !== 'both') {
        if (!lfsBySex[sex]) lfsBySex[sex] = {};
        if (!lfsBySex[sex][year]) {
          lfsBySex[sex][year] = metrics;
        }
      }
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'labour', 'lfs-by-state.json'),
      JSON.stringify(lfsByState, null, 2)
    );
    console.log('✓ Created labour/lfs-by-state.json');

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'labour', 'lfs-by-sex.json'),
      JSON.stringify(lfsBySex, null, 2)
    );
    console.log('✓ Created labour/lfs-by-sex.json');
  }

  // Annual LFS by district
  const lfsDistrictFile = files.find(f => f.filename === 'lfs_district.csv');
  if (lfsDistrictFile) {
    const lfsByDistrict = {};
    lfsDistrictFile.data.forEach(row => {
      const state = standardizeState(row.state);
      const district = row.district;
      const year = parseInt(row.date?.split('-')[0]);
      if (!state || !district || !year) return;

      if (!lfsByDistrict[state]) lfsByDistrict[state] = {};
      if (!lfsByDistrict[state][district]) lfsByDistrict[state][district] = {};

      lfsByDistrict[state][district][year] = {
        employed: parseNumeric(row.lf_employed),
        unemployed: parseNumeric(row.lf_unemployed),
        labour_force: parseNumeric(row.lf),
        participation_rate: parseNumeric(row.p_rate),
        unemployment_rate: parseNumeric(row.u_rate)
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'labour', 'lfs-by-district.json'),
      JSON.stringify(lfsByDistrict, null, 2)
    );
    console.log('✓ Created labour/lfs-by-district.json');
  }

  // National annual trend (lfs_year.csv or lfs_year (1).csv)
  const lfsYearFile = files.find(f => f.baseName === 'lfs_year.csv');
  if (lfsYearFile) {
    const nationalTrend = {};
    lfsYearFile.data.forEach(row => {
      const year = parseInt(row.date?.split('-')[0]);
      if (!year) return;

      nationalTrend[year] = {
        employed: parseNumeric(row.lf_employed),
        unemployed: parseNumeric(row.lf_unemployed),
        labour_force: parseNumeric(row.lf),
        participation_rate: parseNumeric(row.p_rate),
        unemployment_rate: parseNumeric(row.u_rate)
      };
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'labour', 'lfs-national-trend.json'),
      JSON.stringify(nationalTrend, null, 2)
    );
    console.log('✓ Created labour/lfs-national-trend.json');
  }

  // Youth unemployment
  const youthFile = files.find(f => f.filename.includes('lfs_month_youth'));
  if (youthFile) {
    const youthData = youthFile.data.map(row => ({
      date: row.date,
      year: parseInt(row.date?.split('-')[0]),
      month: parseInt(row.date?.split('-')[1]),
      unemployed_15_24: parseNumeric(row.unemployed_15_24),
      unemployment_rate_15_24: parseNumeric(row.u_rate_15_24),
      unemployed_15_30: parseNumeric(row.unemployed_15_30),
      unemployment_rate_15_30: parseNumeric(row.u_rate_15_30)
    })).filter(d => d.year);

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'labour', 'lfs-youth.json'),
      JSON.stringify(youthData, null, 2)
    );
    console.log('✓ Created labour/lfs-youth.json');
  }

  // Quarterly state data
  const qtrStateFile = files.find(f => f.filename === 'lfs_qtr_state.csv');
  if (qtrStateFile) {
    const qtrByState = {};
    qtrStateFile.data.forEach(row => {
      const state = standardizeState(row.state);
      if (!state) return;

      if (!qtrByState[state]) qtrByState[state] = [];

      qtrByState[state].push({
        date: row.date,
        employed: parseNumeric(row.lf_employed),
        unemployed: parseNumeric(row.lf_unemployed),
        labour_force: parseNumeric(row.lf),
        unemployment_rate: parseNumeric(row.u_rate),
        participation_rate: parseNumeric(row.p_rate)
      });
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'labour', 'lfs-quarterly-by-state.json'),
      JSON.stringify(qtrByState, null, 2)
    );
    console.log('✓ Created labour/lfs-quarterly-by-state.json');
  }
}

// Process Education data
async function processEducationData(files) {
  console.log('\n--- Processing Education Data ---');

  // School completion rates
  const completionFile = files.find(f => f.filename.includes('completion_school_state'));
  if (completionFile) {
    const completionByState = {};
    completionFile.data.forEach(row => {
      const state = standardizeState(row.state);
      if (!state || state === 'Malaysia') return; // Skip national aggregate

      const year = parseInt(row.date?.split('-')[0]);
      const sex = row.sex;
      if (!year || sex !== 'both') return; // Only use 'both' to avoid duplicates

      if (!completionByState[state]) completionByState[state] = {};

      const stage = row.stage; // 'primary', 'lower_secondary', 'upper_secondary'
      if (!completionByState[state][year]) completionByState[state][year] = {};
      completionByState[state][year][stage] = parseNumeric(row.completion);
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'education', 'school-completion.json'),
      JSON.stringify(completionByState, null, 2)
    );
    console.log('✓ Created education/school-completion.json');
  }

  // School enrollment
  const enrolmentFile = files.find(f => f.baseName === 'enrolment_school_district.csv');
  if (enrolmentFile) {
    const enrolmentByState = {};
    enrolmentFile.data.forEach(row => {
      const state = standardizeState(row.state);
      const sex = row.sex;
      if (!state || sex !== 'both') return; // Only use 'both' to avoid duplicates

      const year = parseInt(row.date?.split('-')[0]);
      if (!year) return;

      if (!enrolmentByState[state]) enrolmentByState[state] = {};
      if (!enrolmentByState[state][year]) enrolmentByState[state][year] = {};

      const stage = row.stage;
      const currentValue = enrolmentByState[state][year][stage] || 0;
      enrolmentByState[state][year][stage] = currentValue + (parseNumeric(row.students) || 0);
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'education', 'school-enrolment.json'),
      JSON.stringify(enrolmentByState, null, 2)
    );
    console.log('✓ Created education/school-enrolment.json');
  }

  // Schools by district
  const schoolsFile = files.find(f => f.filename.includes('schools_district'));
  if (schoolsFile) {
    const schoolsByDistrict = {};
    schoolsFile.data.forEach(row => {
      const state = standardizeState(row.state);
      const district = row.district;
      if (!state || !district) return;

      const year = parseInt(row.date?.split('-')[0]);
      if (!year) return;

      if (!schoolsByDistrict[state]) schoolsByDistrict[state] = {};
      if (!schoolsByDistrict[state][district]) schoolsByDistrict[state][district] = {};
      if (!schoolsByDistrict[state][district][year]) schoolsByDistrict[state][district][year] = {};

      const stage = row.stage;
      const currentValue = schoolsByDistrict[state][district][year][stage] || 0;
      schoolsByDistrict[state][district][year][stage] = currentValue + (parseNumeric(row.schools) || 0);
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'education', 'schools-by-district.json'),
      JSON.stringify(schoolsByDistrict, null, 2)
    );
    console.log('✓ Created education/schools-by-district.json');
  }

  // Teachers by district
  const teachersFile = files.find(f => f.filename.includes('teachers_district'));
  if (teachersFile) {
    const teachersByDistrict = {};
    teachersFile.data.forEach(row => {
      const state = standardizeState(row.state);
      const district = row.district;
      const sex = row.sex;
      if (!state || !district || sex !== 'both') return; // Only use 'both' to avoid duplicates

      const year = parseInt(row.date?.split('-')[0]);
      if (!year) return;

      if (!teachersByDistrict[state]) teachersByDistrict[state] = {};
      if (!teachersByDistrict[state][district]) teachersByDistrict[state][district] = {};
      if (!teachersByDistrict[state][district][year]) teachersByDistrict[state][district][year] = 0;

      teachersByDistrict[state][district][year] += parseNumeric(row.teachers) || 0;
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'education', 'teachers-by-district.json'),
      JSON.stringify(teachersByDistrict, null, 2)
    );
    console.log('✓ Created education/teachers-by-district.json');
  }

  // Lecturers
  const lecturersFile = files.find(f => f.filename.includes('lecturers_uni'));
  if (lecturersFile) {
    const lecturersData = {};
    lecturersFile.data.forEach(row => {
      const year = parseInt(row.date?.split('-')[0]);
      const sex = row.sex;
      if (!year || sex !== 'both') return; // Only use 'both' to avoid duplicates

      const university = row.university;
      if (!lecturersData[year]) lecturersData[year] = {};
      if (!lecturersData[year][university]) lecturersData[year][university] = 0;
      lecturersData[year][university] += parseNumeric(row.staff) || 0;
    });

    fs.writeFileSync(
      path.join(OUTPUT_DIR, 'education', 'lecturers.json'),
      JSON.stringify(lecturersData, null, 2)
    );
    console.log('✓ Created education/lecturers.json');
  }
}

// Create state summary (merged latest data from all datasets)
async function createStateSummary(files) {
  console.log('\n--- Creating State Summary ---');

  // Load all processed data
  const gdpData = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'economic', 'gdp-by-state.json'), 'utf-8'));
  const incomeData = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'economic', 'household-income.json'), 'utf-8'));
  const giniData = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'economic', 'gini-coefficient.json'), 'utf-8'));
  const lfsData = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'labour', 'lfs-by-state.json'), 'utf-8'));
  const completionData = JSON.parse(fs.readFileSync(path.join(OUTPUT_DIR, 'education', 'school-completion.json'), 'utf-8'));

  const stateNames = [
    'Johor', 'Kedah', 'Kelantan', 'Melaka', 'Negeri Sembilan', 'Pahang',
    'Perak', 'Perlis', 'Pulau Pinang', 'Sabah', 'Sarawak', 'Selangor',
    'Terengganu', 'W.P. Kuala Lumpur', 'W.P. Putrajaya', 'W.P. Labuan'
  ];

  const summary = {};

  stateNames.forEach(state => {
    summary[state] = {};

    // Get latest GDP
    if (gdpData[state]) {
      const latestYear = Math.max(...Object.keys(gdpData[state]).map(Number));
      const gdpYearData = gdpData[state][latestYear];
      summary[state].gdp_total = Object.values(gdpYearData).reduce((sum, val) => sum + (val || 0), 0);
      summary[state].gdp_sectors = gdpYearData;
      summary[state].gdp_year = latestYear;
    }

    // Get latest income
    if (incomeData[state]) {
      const latestYear = Math.max(...Object.keys(incomeData[state]).map(Number));
      summary[state].mean_income = incomeData[state][latestYear].mean;
      summary[state].median_income = incomeData[state][latestYear].median;
      summary[state].income_year = latestYear;
    }

    // Get latest Gini
    if (giniData[state]) {
      const latestYear = Math.max(...Object.keys(giniData[state]).map(Number));
      summary[state].gini = giniData[state][latestYear];
      summary[state].gini_year = latestYear;
    }

    // Get latest LFS
    if (lfsData[state]) {
      const latestYear = Math.max(...Object.keys(lfsData[state]).map(Number));
      const lfsYearData = lfsData[state][latestYear];
      summary[state].unemployment_rate = lfsYearData.unemployment_rate;
      summary[state].participation_rate = lfsYearData.participation_rate;
      summary[state].employed = lfsYearData.employed;
      summary[state].unemployed = lfsYearData.unemployed;
      summary[state].labour_force = lfsYearData.labour_force;
      summary[state].lfs_year = latestYear;
    }

    // Get latest school completion
    if (completionData[state]) {
      const latestYear = Math.max(...Object.keys(completionData[state]).map(Number));
      const completionYearData = completionData[state][latestYear];
      // Calculate average completion rate across levels
      const rates = Object.values(completionYearData).filter(v => v !== null);
      if (rates.length > 0) {
        summary[state].school_completion_rate = rates.reduce((sum, r) => sum + r, 0) / rates.length;
      }
      summary[state].school_completion_by_level = completionYearData;
      summary[state].completion_year = latestYear;
    }
  });

  fs.writeFileSync(
    path.join(OUTPUT_DIR, 'summary-by-state.json'),
    JSON.stringify(summary, null, 2)
  );
  console.log('✓ Created summary-by-state.json');
}

// Run the script
processAllData().catch(error => {
  console.error('Error processing data:', error);
  process.exit(1);
});
