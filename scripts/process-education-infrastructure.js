import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load existing processed data
const schoolsData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/education/schools-by-district.json'), 'utf-8')
);

const teachersData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/education/teachers-by-district.json'), 'utf-8')
);

const enrolmentData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/education/school-enrolment.json'), 'utf-8')
);

const summaryData = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../src/data/summary-by-state.json'), 'utf-8')
);

// Estimate population from labour force data
function estimatePopulation(labourForce, participationRate) {
  if (!labourForce || !participationRate) return null;
  return (labourForce / participationRate) * 100;
}

// Aggregate education infrastructure by state
function aggregateByState() {
  const results = {};
  const latestYear = 2022; // Use 2022 as the latest year with complete data

  // Process each state
  Object.keys(schoolsData).forEach(state => {
    if (state === 'Malaysia') return; // Skip national aggregate

    const stateSchools = schoolsData[state]['All Districts'];
    const stateTeachers = teachersData[state]['All Districts'];
    const stateEnrolment = enrolmentData[state];
    const stateSummary = summaryData[state];

    if (!stateSchools || !stateTeachers || !stateSummary) return;

    // Get latest year data
    const schools = stateSchools[latestYear];
    const teachers = stateTeachers[latestYear];
    const enrolment = stateEnrolment ? stateEnrolment[latestYear] : null;

    if (!schools || !teachers) return;

    // Calculate totals
    const totalSchools = (schools.primary || 0) + (schools.secondary || 0);
    const totalTeachers = teachers;
    const totalEnrolment = enrolment ? (enrolment.primary || 0) + (enrolment.secondary || 0) : null;

    // Calculate student-teacher ratio
    const studentTeacherRatio = totalEnrolment && totalTeachers > 0
      ? totalEnrolment / totalTeachers
      : null;

    // Estimate population
    const estimatedPop = estimatePopulation(
      stateSummary.labour_force,
      stateSummary.participation_rate
    );

    // Calculate schools per 100k population
    const schoolsPer100k = estimatedPop && totalSchools > 0
      ? (totalSchools / (estimatedPop * 1000)) * 100000
      : null;

    // Calculate teachers per 100k population
    const teachersPer100k = estimatedPop && totalTeachers > 0
      ? (totalTeachers / (estimatedPop * 1000)) * 100000
      : null;

    results[state] = {
      state,
      year: latestYear,

      // School counts
      primary_schools: schools.primary || 0,
      secondary_schools: schools.secondary || 0,
      tertiary_schools: schools.tertiary || 0,
      total_schools: totalSchools,

      // Teacher counts
      total_teachers: totalTeachers,

      // Enrolment
      primary_enrolment: enrolment ? enrolment.primary : null,
      secondary_enrolment: enrolment ? enrolment.secondary : null,
      total_enrolment: totalEnrolment,

      // Calculated metrics
      student_teacher_ratio: studentTeacherRatio !== null
        ? Math.round(studentTeacherRatio * 10) / 10
        : null,
      schools_per_100k: schoolsPer100k !== null
        ? Math.round(schoolsPer100k * 10) / 10
        : null,
      teachers_per_100k: teachersPer100k !== null
        ? Math.round(teachersPer100k * 10) / 10
        : null,

      // Reference data
      estimated_population: estimatedPop !== null ? Math.round(estimatedPop) : null,
      labour_force: stateSummary.labour_force,
      participation_rate: stateSummary.participation_rate,
      school_completion_rate: stateSummary.school_completion_rate || null
    };
  });

  return results;
}

// Main execution
console.log('Processing education infrastructure data...');
const infrastructure = aggregateByState();

// Create output directory if needed
const outputDir = path.join(__dirname, '../src/data/education');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Write output
const outputPath = path.join(outputDir, 'infrastructure-by-state.json');
fs.writeFileSync(outputPath, JSON.stringify(infrastructure, null, 2));

console.log(`✓ Education infrastructure processed for ${Object.keys(infrastructure).length} states`);
console.log(`✓ Output written to: ${outputPath}`);

// Print summary statistics
const states = Object.values(infrastructure);
const validRatios = states.map(s => s.student_teacher_ratio).filter(v => v !== null);
const validSchoolsPer100k = states.map(s => s.schools_per_100k).filter(v => v !== null);

if (validRatios.length > 0) {
  console.log(`\nStudent-Teacher Ratio:`);
  console.log(`  Range: ${Math.min(...validRatios).toFixed(1)} - ${Math.max(...validRatios).toFixed(1)}`);
  console.log(`  Mean: ${(validRatios.reduce((a, b) => a + b, 0) / validRatios.length).toFixed(1)}`);
}

if (validSchoolsPer100k.length > 0) {
  console.log(`\nSchools per 100k Population:`);
  console.log(`  Range: ${Math.min(...validSchoolsPer100k).toFixed(1)} - ${Math.max(...validSchoolsPer100k).toFixed(1)}`);
  console.log(`  Mean: ${(validSchoolsPer100k.reduce((a, b) => a + b, 0) / validSchoolsPer100k.length).toFixed(1)}`);
}

// Show sample states
console.log(`\nSample states:`);
const sampleStates = ['Selangor', 'Johor', 'Sabah'].filter(s => infrastructure[s]);
sampleStates.forEach(state => {
  const data = infrastructure[state];
  console.log(`  ${state}:`);
  console.log(`    Schools: ${data.total_schools}, Teachers: ${data.total_teachers}`);
  console.log(`    Student-Teacher Ratio: ${data.student_teacher_ratio}`);
  console.log(`    Schools per 100k: ${data.schools_per_100k}`);
});
