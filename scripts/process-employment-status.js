/**
 * Process employment status data from monthly LFS
 * Extracts latest month's employment distribution
 */

import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSV_FILE = path.join(__dirname, '..', 'data', 'MONTHLY_SERIES', 'lfs_month_status.csv');
const OUTPUT_FILE = path.join(__dirname, '..', 'src', 'data', 'labour', 'employment-status-latest.json');

console.log('Processing employment status data...');

// Read and parse CSV
const csvContent = fs.readFileSync(CSV_FILE, 'utf-8');
const records = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
  trim: true,
  cast: (value, context) => {
    // Try to convert to number if possible
    const num = parseFloat(value);
    return isNaN(num) ? value : num;
  }
});

// Get latest month data (last row with 'persons' variable)
const personRows = records.filter(row => row.variable === 'persons');
const latestRow = personRows[personRows.length - 1];

if (!latestRow) {
  console.error('No data found!');
  process.exit(1);
}

const totalEmployed = latestRow.employed || 0;

const output = {
  date: latestRow.date,
  totalEmployed: totalEmployed,
  breakdown: {
    employee: {
      value: latestRow.employed_employee || 0,
      percentage: totalEmployed > 0 ? ((latestRow.employed_employee || 0) / totalEmployed * 100) : 0
    },
    ownAccount: {
      value: latestRow.employed_own_account || 0,
      percentage: totalEmployed > 0 ? ((latestRow.employed_own_account || 0) / totalEmployed * 100) : 0
    },
    employer: {
      value: latestRow.employed_employer || 0,
      percentage: totalEmployed > 0 ? ((latestRow.employed_employer || 0) / totalEmployed * 100) : 0
    },
    unpaidFamily: {
      value: latestRow.employed_unpaid_family || 0,
      percentage: totalEmployed > 0 ? ((latestRow.employed_unpaid_family || 0) / totalEmployed * 100) : 0
    }
  },
  metadata: {
    processedDate: new Date().toISOString(),
    source: 'DOSM Monthly Labour Force Survey',
    variable: 'persons (thousands)'
  }
};

// Ensure output directory exists
const outputDir = path.dirname(OUTPUT_FILE);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write output
fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2));

console.log('✅ Employment status data processed!');
console.log(`   Output: ${OUTPUT_FILE}`);
console.log(`   Latest date: ${output.date}`);
console.log(`   Total employed: ${totalEmployed.toLocaleString()}k`);
console.log(`   Breakdown:`);
console.log(`     - Employee: ${output.breakdown.employee.percentage.toFixed(1)}%`);
console.log(`     - Own Account: ${output.breakdown.ownAccount.percentage.toFixed(1)}%`);
console.log(`     - Employer: ${output.breakdown.employer.percentage.toFixed(1)}%`);
console.log(`     - Unpaid Family: ${output.breakdown.unpaidFamily.percentage.toFixed(1)}%`);
