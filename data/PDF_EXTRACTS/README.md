# PDF Data Extraction - Summary

## ✅ Completed Extractions

### Graduate Tracer Study 2024 (HIGHEST PRIORITY)

Successfully extracted and cleaned employment data for 2024 graduates:

#### 1. Employment by State (`tracer_employment_by_state_2024_clean.csv`)
**Powers your state-level map!**

- **16 states** + Federal Territories
- **Columns**: year, state, employed_count, employed_pct, unemployed_count, unemployed_pct, total_graduates, total_pct
- **Key insights**:
  - Selangor: 94.0% employment (58,447 graduates)
  - Johor: 93.9% employment (25,454 graduates)
  - Kelantan: 89.1% employment (12,432 graduates)
  - Sabah: 89.0% employment (13,351 graduates)

#### 2. Employment by Field of Study (`tracer_employment_by_field_2024_clean.csv`)
**Shows education-employment mismatch**

- **11 fields** of study
- **Columns**: year, field_of_study, employed_count, employed_pct, unemployed_count, unemployed_pct, total_graduates, total_pct, field_of_study_en
- **Key insights**:
  - Engineering: 94.9% employment (62,503 graduates)
  - Education: 89.8% employment (20,003 graduates)
  - ICT: 93.7% employment (15,998 graduates)
  - Services: 89.9% employment (14,080 graduates)

#### 3. Employment by Level of Study (`tracer_employment_by_level_2024_clean.csv`)
**Graduation level breakdown**

- **6 levels**: Diploma, Bachelor's, Master's, PhD, etc.
- **Columns**: year, level_of_study, employed_count, employed_pct, unemployed_count, unemployed_pct, total_graduates, total_pct

---

## 📁 Files Generated

```
data/PDF_EXTRACTS/
├── README.md (this file)
│
├── Raw extracts:
├── tracer_employment_by_state_2024.csv
├── tracer_employment_by_field_2024.csv
├── tracer_employment_by_level_2024.csv
├── tracer_employment_type_2024.csv
│
└── Clean/analysis-ready:
    ├── tracer_employment_by_state_2024_clean.csv      ⭐ Use for map
    ├── tracer_employment_by_field_2024_clean.csv      ⭐ Use for trends
    └── tracer_employment_by_level_2024_clean.csv      ⭐ Use for analysis
```

---

## 🛠️ Extraction Scripts Created

### 1. `scripts/pdf-explorer.py`
Explore PDF structure to find tables

**Usage:**
```bash
python scripts/pdf-explorer.py "data/GRADUATES_STATISTICS/1. Statistik Siswazah 2024.pdf"
```

### 2. `scripts/extract-tracer-study.py`
Extract tables from Graduate Tracer Study PDFs

**Usage:**
```bash
python scripts/extract-tracer-study.py
```

### 3. `scripts/clean-pdf-extracts.py`
Clean raw extracts into analysis-ready CSVs

**Usage:**
```bash
python scripts/clean-pdf-extracts.py
```

### 4. `scripts/pdf-extractor.py`
Generic extraction helper with examples

---

## 📋 Next Steps - Remaining PDFs to Extract

### Priority 1: Graduates Statistics (2021-2024)

**Files:**
- `data/GRADUATES_STATISTICS/1. Statistik Siswazah 2024.pdf`
- `data/GRADUATES_STATISTICS/Penerbitan Statistik Siswazah 2023.pdf`
- `data/GRADUATES_STATISTICS/Statistik Siswazah 2022.pdf`
- `data/GRADUATES_STATISTICS/Statistik Siswazah 2021.pdf`

**What to extract:**
1. Total graduates by level (Diploma, Bachelor's, Master's, PhD)
2. Graduates by field of study
3. Graduates by state of institution
4. Graduates by sex

**How to extract:**
```bash
# 1. Explore the PDF first
python scripts/pdf-explorer.py "data/GRADUATES_STATISTICS/1. Statistik Siswazah 2024.pdf"

# 2. Identify table page numbers
# 3. Create custom extraction script (similar to extract-tracer-study.py)
```

### Priority 2: Higher Education PDFs

#### Bab 2: Public Universities (UA)
- Student enrolment by university and field
- Academic staff by university
- Graduation rates

#### Bab 3: Private HEIs (IPTS)
- Number of private HEIs by state ⭐ (for map)
- Student enrolment by field

#### Bab 4: Polytechnics
- Enrolment by state ⭐ (for map)
- Fields of study

#### Bab 5: Community Colleges
- Enrolment by state ⭐ (for map)

#### Bab 7: Tracer Study 2023
- Repeat extraction for 2023 data (for year-over-year trends)

---

## 💡 Tips for Extracting Remaining PDFs

1. **Always explore first:**
   ```bash
   python scripts/pdf-explorer.py "path/to/file.pdf"
   ```

2. **Create targeted extraction scripts:**
   - Copy `scripts/extract-tracer-study.py` as a template
   - Modify page numbers and table indices
   - Run extraction + cleaning

3. **Use consistent naming:**
   - Pattern: `{category}_{breakdown}_{year}.csv`
   - Example: `graduates_by_state_2024.csv`

4. **Focus on state-level data:**
   - Prioritize tables with state breakdowns (powers the map)
   - National-level data is still useful for trends

5. **Document as you go:**
   - Note which page contains which table
   - Comment your extraction scripts

---

## 🗺️ How This Data Powers Your Dashboard

### State-Level Map Layer
```
tracer_employment_by_state_2024_clean.csv
  └─> Shows graduate employment rate per state
  └─> Combines with LFS unemployment data
  └─> Visualizes education → employment pipeline
```

### Education-Employment Funnel
```
School completion (EDUCATION CSVs)
  ↓
Higher Ed enrolment (from Bab 2-5 PDFs - TO EXTRACT)
  ↓
Graduation (from Graduates Statistics PDFs - TO EXTRACT)
  ↓
Employment (tracer_employment_by_field_2024_clean.csv) ✅
  ↓
Labour market (ANNUAL_LFS, MONTHLY_SERIES CSVs)
```

### Field-of-Study Mismatch Analysis
```
tracer_employment_by_field_2024_clean.csv
  └─> Compare fields with high/low employment rates
  └─> Cross-reference with GDP sectors by state
  └─> Identify skill gaps
```

---

## 📊 Data Quality Notes

- **Numbers are clean**: Commas removed, converted to numeric types
- **Percentages are floats**: 93.9 (not "93.9%")
- **State names standardized**: "Wilayah Persekutuan" → "WP"
- **Year column added**: For multi-year analysis
- **Bilingual fields preserved**: Both Malay and English names kept where available

---

## 🎯 Your Next Action

1. **Extract Graduates Statistics 2024** (total graduates by state/field)
   - This complements the employment data you already have

2. **Extract HEI data from Bab 2-5** (education infrastructure by state)
   - Powers additional map layers

3. **Extract Tracer Study 2023** (for trend analysis)
   - Compare 2023 vs 2024 employment rates

**Or start building your dashboard with the cleaned data you already have!**

The state-level employment data (`tracer_employment_by_state_2024_clean.csv`) is ready to integrate with your existing LFS and education CSVs.
