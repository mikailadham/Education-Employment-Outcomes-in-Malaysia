import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load CSV files
const productivityData = fs.readFileSync(
  path.join(__dirname, '../data/LABOUR_PRODUCTIVITY/productivity_annual.csv'),
  'utf-8'
);

const lookupData = fs.readFileSync(
  path.join(__dirname, '../data/LABOUR_PRODUCTIVITY/productivity_lookup.csv'),
  'utf-8'
);

// Parse CSVs
const productivityRecords = parse(productivityData, { columns: true });
const lookupRecords = parse(lookupData, { columns: true });

// Create sector lookup map
const sectorMap = {};
lookupRecords.forEach(record => {
  sectorMap[record.code] = {
    code: record.code,
    name: record.desc_en,
    name_bm: record.desc_bm
  };
});

// Process productivity data by sector
function processProductivityBySector() {
  // Get the latest year
  const years = [...new Set(productivityRecords.map(r => r.date.substring(0, 4)))];
  const latestYear = Math.max(...years.map(y => parseInt(y)));
  const latestYearStr = latestYear.toString();

  console.log(`Using latest year: ${latestYear}`);

  // Filter for latest year and absolute values only (not growth)
  const latestData = productivityRecords.filter(record => {
    const year = record.date.substring(0, 4);
    const series = record.series;
    return year === latestYearStr && series === 'abs';
  });

  // Process sectors
  const sectors = [];
  const mainSectorCodes = ['p1', 'p2', 'p3', 'p4', 'p5']; // Exclude p0 (overall)

  latestData.forEach(record => {
    const sectorCode = record.sector;
    const sectorInfo = sectorMap[sectorCode];

    // Include main sectors and their subsectors
    if (sectorInfo) {
      const outputPerHour = parseFloat(record.output_hour);
      const outputPerEmployee = parseFloat(record.output_employment);
      const gdp = parseFloat(record.gdp);
      const hours = parseFloat(record.hours);
      const employment = parseFloat(record.employment);

      sectors.push({
        code: sectorCode,
        name: sectorInfo.name,
        level: sectorCode.split('.').length, // 1 for main sectors, 2 for subsectors
        is_main_sector: mainSectorCodes.includes(sectorCode),
        productivity_per_hour: !isNaN(outputPerHour) ? Math.round(outputPerHour * 10) / 10 : null,
        productivity_per_employee: !isNaN(outputPerEmployee) ? Math.round(outputPerEmployee) : null,
        gdp: !isNaN(gdp) ? Math.round(gdp) : null,
        hours_worked: !isNaN(hours) ? Math.round(hours) : null,
        employment: !isNaN(employment) ? Math.round(employment) : null
      });
    }
  });

  // Sort sectors by code
  sectors.sort((a, b) => a.code.localeCompare(b.code));

  return {
    year: latestYear,
    sectors,
    main_sectors: sectors.filter(s => s.is_main_sector),
    subsectors: sectors.filter(s => !s.is_main_sector && s.level === 2)
  };
}

// Main execution
console.log('Processing labour productivity data...');
const productivityBySector = processProductivityBySector();

// Create output directory
const outputDir = path.join(__dirname, '../src/data/labour');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created labour directory');
}

// Write output
const outputPath = path.join(outputDir, 'productivity-by-sector.json');
fs.writeFileSync(outputPath, JSON.stringify(productivityBySector, null, 2));

console.log(`✓ Productivity data processed for ${productivityBySector.sectors.length} sectors`);
console.log(`  - Main sectors: ${productivityBySector.main_sectors.length}`);
console.log(`  - Subsectors: ${productivityBySector.subsectors.length}`);
console.log(`✓ Output written to: ${outputPath}`);

// Print summary statistics
console.log(`\nProductivity by Main Sector (${productivityBySector.year}):`);
productivityBySector.main_sectors.forEach(sector => {
  console.log(`  ${sector.name}:`);
  console.log(`    Output per hour: RM ${sector.productivity_per_hour}`);
  console.log(`    Output per employee: RM ${sector.productivity_per_employee?.toLocaleString()}`);
  console.log(`    Employment: ${sector.employment?.toLocaleString()} thousand`);
});

// Find highest and lowest productivity
const validSectors = productivityBySector.main_sectors.filter(s => s.productivity_per_hour !== null);
if (validSectors.length > 0) {
  const highest = validSectors.reduce((max, s) =>
    s.productivity_per_hour > max.productivity_per_hour ? s : max
  );
  const lowest = validSectors.reduce((min, s) =>
    s.productivity_per_hour < min.productivity_per_hour ? s : min
  );

  console.log(`\nProductivity Range:`);
  console.log(`  Highest: ${highest.name} (RM ${highest.productivity_per_hour}/hour)`);
  console.log(`  Lowest: ${lowest.name} (RM ${lowest.productivity_per_hour}/hour)`);
}
