# 🇲🇾 Malaysia Education & Employment Outcomes Dashboard

An **advanced interactive data visualization dashboard** analyzing Malaysia's education-employment-wellbeing nexus using official government datasets for **Data Challenge 5.0** themed on sustainable well-being.

> **Status**: ✅ **Production-Ready** — Complete with 8 analytical sections, 24+ interactive visualizations, and comprehensive graduate employment analytics (2020-2024)

---

## 🎯 Key Features

### **Core Functionality**
- ✅ **Interactive Malaysia SVG Map** — Click states to explore detailed metrics
- ✅ **15+ Selectable Metrics** — Switch between unemployment, GDP, income, MyWI, education, and more
- ✅ **Choropleth Visualization** — Color-coded states with intelligent sequential scales
- ✅ **State Comparison Tool** — Compare 2-5 states OR compare 1 state across multiple years
- ✅ **Malaysian Well-Being Index (MyWI) Integration** — 15-year trend analysis (2010-2024)
- ✅ **Graduate Tracer Study Deep Dive** — 5-year comprehensive employment outcomes (2020-2024)
- ✅ **Advanced Analytics** — K-means clustering, composite indices, correlation analysis
- ✅ **Mobile-Optimized** — Touch-friendly, responsive design for all devices
- ✅ **Fast Static Site** — Instant loading with Astro static generation

---

## 📊 Dashboard Sections

### **Section 1: Hero & National Overview**
6 national KPI cards with latest statistics:
- National unemployment rate: **3.3%** (2023)
- Labour force participation: **68.6%** (2023)
- Graduate employment rate: **86.4%** (2024)
- Mean household income: **RM 5,209** (2022)
- MyWI Overall: **116.9** (2024)
- Total labour force: **16.9 million** (2023)

### **Section 2: Interactive Malaysia Map**
- Click any of 16 states/federal territories
- Switch between 15+ metrics via dropdown
- Hover tooltips with comprehensive data
- Reveals state-specific MyWI trends on click

### **Section 3: State & Year Comparison Tool** 🆕
**Two comparison modes:**
1. **Compare by States**: Select 2-5 states for side-by-side analysis
2. **Compare by Years**: Select 1 state and 2-5 years for temporal analysis

**Visualizations:**
- MyWI trend line charts (2010-2024)
- Sub-composite bar charts (Economic, Social, Environmental)
- Radar charts comparing 6 key components
- Quick stats comparison tables

### **Section 4: Employment Trends Analysis**
- **Dual-line trend**: Youth vs overall unemployment (2016-2025)
- **Employment status donut**: Distribution by employment type

### **Section 5: Education Infrastructure & Outcomes**
- **School completion bar chart**: Sortable by state
- **Enrollment bubble chart**: Students vs teachers with student-teacher ratio
- **Graduate output stacked bar**: Trends by state (2020-2024)

### **Section 6: Labour Market Dynamics**
- **LFPR ranked bar**: States ranked by labour force participation
- **GDP vs Unemployment scatter**: Correlation analysis with trendline
- **Productivity heatmap**: Labour productivity across 5 economic sectors

### **Section 7: Education-Employment Pipeline Analysis** ⭐ KEY INSIGHTS
**Advanced analytics with composite indices:**

**Quadrant Scatter (Most Important Visualization):**
- X-axis: Education Supply Index (ESI)
- Y-axis: Employment Outcome Index (EOI)
- 4 strategic quadrants:
  - **Optimal Alignment** (High ESI, High EOI): States performing well
  - **Oversupply Risk** (High ESI, Low EOI): Need job creation
  - **Education Shortage** (Low ESI, High EOI): Need education expansion
  - **Development Priority** (Low ESI, Low EOI): Need comprehensive support

**K-Means Clustering Visualization:**
- 3 clusters identified: Advanced Economies, Developing Markets, Emerging Regions
- Cluster centroids marked with black borders
- States grouped by similar characteristics

### **Section 8: Graduate Tracer Study Deep Dive (2020-2024)** 🆕
**Comprehensive 5-year graduate employment analysis:**

**4 Interactive Visualizations:**

1. **Graduate Unemployment by Field of Study**
   - 10 fields tracked (Engineering, ICT, Business, Education, Health, etc.)
   - Color-coded: Green (<7%), Amber (7-10%), Red (>10%)
   - **Best field**: Engineering at **5.1%** unemployment (2024)
   - **Worst field**: Education at **10.2%** unemployment (2024)

2. **Graduate Unemployment by State Ranking**
   - All 16 states ranked
   - **Bottom 3** (Sabah, Kelantan, Sarawak) highlighted in red
   - **Top performer** (Putrajaya) highlighted in green
   - **Best state**: Putrajaya at **4.7%** (2024)
   - **Worst state**: Sabah at **11.0%** (2024)

3. **Public vs Private HEI Unemployment Gap** ⭐ KEY INSIGHT
   - Dual-line chart with shaded gap area
   - **2.5x multiplier**: Private HEI graduates are 2.5x more likely to be unemployed
   - Public universities: **5.1%** vs Private HEIs: **12.8%** (2024)
   - Gap has widened from **7.3pp** (2020) to **7.7pp** (2024)
   - Includes 2024 methodology change warning

4. **Graduate Unemployment by Institution Type**
   - 5 institution types compared
   - **Best performers**: Polytechnics & Community Colleges at **1.2%** (2024)
   - **Worst performer**: Private HEIs at **12.8%** (2024)
   - 5-year trend comparison table

**Key Graduate Employment Findings:**
- **National graduate unemployment**: 7.5% (2024) - down from 15.6% (2020)
- **Geographic disparities**: Sabah/Kelantan/Sarawak consistently underperform
- **Field performance**: Engineering excels while Education/Services struggle
- **Institution gap**: Public institutions far outperform private ones
- **Policy implications**: Different states/fields require tailored interventions

---

## 📈 Composite Indices (Custom Analytics)

### **Education Supply Index (ESI)**
Weighted combination of:
- Schools per 100k population (33%)
- School completion rate (33%)
- Student-teacher ratio inverse (34%)

### **Employment Outcome Index (EOI)**
Weighted combination of:
- Employment rate (33%)
- Labour force participation rate (33%)
- GDP per capita (34%)

### **EEAI (Education-Employment Alignment Index)**
Composite of ESI and EOI showing overall state alignment

---

## 🛠 Tech Stack

- **Framework**: Astro 5.18.0 (Static Site Generation)
- **UI Library**: React 19 (Client-side islands)
- **Styling**: Tailwind CSS 4 (Utility-first)
- **Charts**: Recharts 3.7 (All visualizations)
- **Data Processing**: Node.js with csv-parse
- **Build Tool**: Vite (Fast HMR)
- **Deployment**: Static output (`dist/`) deployable anywhere

---

## 📊 Data Sources

### **Primary Government Sources:**
1. **Malaysian Well-Being Index (MyWI) 2010-2024** — State-level wellbeing with 3 sub-composites and 16 components
2. **Department of Statistics Malaysia (DOSM) via OpenDOSM:**
   - Labour Force Survey (LFS) — Annual, quarterly, monthly (2016-2025)
   - GDP by State — Economic output by sector (2010-2023)
   - Household Income & Inequality — Mean, median, Gini (2022)
   - Education Statistics — Schools, teachers, completion rates (2016-2022)
3. **Ministry of Higher Education (MOHE):**
   - Graduate Tracer Study (2020-2024) — 7 comprehensive datasets
   - Graduate employment by field, state, institution type, qualification level
   - Graduates Statistics (2020-2024) — Graduate production trends

### **Data Coverage:**
- **States/Territories**: 16 (13 states + 3 federal territories)
- **Years**: 15+ years (2010-2025, varies by metric)
- **Total Data Points**: 10,000+ across all datasets
- **Metrics Tracked**: 50+ individual indicators

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18.x or later
- npm 9.x or later

### Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/mikailadham/Education-Employment-Outcomes-in-Malaysia.git
cd Education-Employment-Outcomes-in-Malaysia

# 2. Install dependencies
npm install

# 3. Process all data (converts raw CSVs to JSON)
npm run process-all-data

# 4. Start development server
npm run dev
# Dashboard available at http://localhost:4321

# 5. Build for production
npm run build
# Static files generated in dist/

# 6. Preview production build
npm run preview
```

### Available NPM Scripts

```bash
npm run dev                    # Start dev server
npm run build                  # Build for production (includes data processing)
npm run preview                # Preview production build
npm run process-data           # Process main data files
npm run process-mywi           # Process MyWI data
npm run process-time-series    # Process unemployment trends
npm run process-education-infra # Process education infrastructure
npm run process-productivity   # Process labour productivity
npm run calculate-indices      # Calculate ESI, EOI, EEAI
npm run prepare-clustering     # Run K-means clustering
npm run process-graduate-tracer # Process graduate tracer study data
npm run process-all-data       # Run all data processing scripts
```

---

## 📁 Project Structure

```
/
├── data/                                    # Raw CSV files (70+ files)
│   ├── ANNUAL_LFS/                         # Labour force survey data
│   ├── ECONOMIC_CONTEXT/                   # GDP, income, inequality
│   ├── EDUCATION/                          # Schools, teachers, enrolment
│   ├── GRADUATES_STATISTICS/               # Graduate tracer study (7 CSVs)
│   ├── LABOUR_PRODUCTIVITY/                # Sector productivity
│   ├── MONTHLY_SERIES/                     # Monthly LFS data
│   ├── QUARTERLY_SERIES/                   # Quarterly LFS data
│   └── WELLBEING/                          # MyWI data (2010-2024)
│
├── scripts/                                 # Data processing scripts (8 scripts)
│   ├── process-data.js                     # Main data aggregation
│   ├── process-mywi-data.js                # MyWI processing
│   ├── process-time-series.js              # Unemployment trends
│   ├── process-education-infrastructure.js # Schools/teachers aggregation
│   ├── process-productivity-heatmap.js     # Productivity by sector
│   ├── calculate-composite-indices.js      # ESI, EOI, EEAI calculation
│   ├── prepare-clustering-data.js          # K-means clustering
│   └── process-graduate-tracer.js          # Graduate tracer study processing
│
├── src/
│   ├── components/                          # React components (21 components)
│   │   ├── MalaysiaMap.jsx                 # Interactive SVG map
│   │   ├── StateComparison.jsx             # State/year comparison tool
│   │   ├── QuadrantScatter.jsx             # ESI vs EOI quadrant (KEY)
│   │   ├── ClusterVisualization.jsx        # K-means clustering
│   │   ├── GraduateFieldChart.jsx          # Unemployment by field
│   │   ├── GraduateStateRanking.jsx        # State rankings
│   │   ├── PublicPrivateGapChart.jsx       # Public vs Private gap (KEY)
│   │   ├── GraduateInstitutionChart.jsx    # Institution type comparison
│   │   ├── DualLineTrend.jsx               # Youth vs overall unemployment
│   │   ├── ProductivityHeatmap.jsx         # Sector productivity
│   │   └── ... (11 more chart components)
│   │
│   ├── data/                                # Processed JSON files (15+ files)
│   │   ├── analytics/                       # Composite indices, clustering
│   │   ├── economic/                        # GDP, income, Gini
│   │   ├── education/                       # Schools, completion, infrastructure
│   │   ├── graduates/                       # Graduate employment
│   │   ├── labour/                          # LFS data, productivity
│   │   ├── wellbeing/                       # MyWI data
│   │   ├── GRADUATES_STATISTICS/            # Graduate tracer processed data
│   │   └── summary-by-state.json           # Merged state metrics
│   │
│   ├── pages/
│   │   └── index.astro                      # Main dashboard (single page)
│   │
│   ├── layouts/
│   │   └── Layout.astro                     # Base layout
│   │
│   └── styles/
│       └── global.css                       # Tailwind + custom styles
│
├── astro.config.mjs                         # Astro configuration
├── tailwind.config.mjs                      # Tailwind configuration
├── package.json                             # Dependencies & scripts
└── README.md                                # This file
```

---

## 📈 Key Statistics

### **Graduate Employment (2024)**
- National graduate unemployment: **7.5%**
- Public university unemployment: **5.1%**
- Private HEI unemployment: **12.8%**
- Gap: **7.7 percentage points** (2.5x multiplier)
- Best field: Engineering **5.1%**
- Worst field: Education **10.2%**
- Best state: Putrajaya **4.7%**
- Worst state: Sabah **11.0%**
- Best institution: Polytechnics **1.2%**
- Worst institution: Private HEIs **12.8%**

### **Labour Market (2023)**
- National unemployment: **3.3%**
- Labour force participation: **68.6%**
- Total labour force: **16.9 million**
- Youth unemployment: Higher than overall (trend)

### **Economic Indicators (2022)**
- National mean income: **RM 5,209**
- Highest income: Kuala Lumpur **RM 13,325**
- Lowest income: Kelantan **RM 4,885**
- National Gini: **0.407**

### **Well-Being (2024)**
- National MyWI Overall: **116.9**
- Highest: Melaka **120.2**
- Lowest: Federal Territories **114.3**
- Trend: Consistent improvement since 2010

---

## 🎨 Design Philosophy

**Editorial Data Journalism Aesthetic:**
- Clean, minimalist layout with generous whitespace
- Typography: Plus Jakarta Sans (modern, readable)
- Color palette: Navy/slate with teal/purple accents
- Smooth transitions and micro-interactions
- Mobile-first responsive design
- Accessibility-focused (color contrast, touch targets)

**Visualization Design:**
- Color-coded performance tiers (green/amber/red)
- Consistent color schemes across related charts
- Interactive tooltips with detailed breakdowns
- Year selectors for temporal analysis
- Clear legends and labels
- Methodology warnings for 2024 data

---

## 🔬 Advanced Analytics

### **K-Means Clustering**
- Algorithm: K-means with k=3
- Features: ESI, EOI, unemployment, income, well-being metrics
- Output: 3 clusters (Advanced Economies, Developing Markets, Emerging Regions)
- Visualization: Scatter plot with color-coded clusters and centroids

### **Composite Index Calculation**
- Min-max normalization for all features
- Weighted aggregation based on domain expertise
- Handles missing data gracefully
- Output ranges: 0-100 for ESI and EOI

### **Correlation Analysis**
- GDP vs Unemployment scatter with trendline
- R² values displayed
- Outlier state identification

---

## ⚠️ Important Notes

### **Data Methodology**
- **2024 Graduate Data**: Uses binary classification (Employed vs Not Working Yet) instead of 5-category classification used in 2020-2023. This affects direct comparability.
- **Wilayah Persekutuan**: MyWI data combines KL, Putrajaya, and Labuan into one entity
- **Missing Data**: Shown as "N/A" or gray on visualizations
- **Data Years**: Vary by source (2010-2025 depending on metric)

### **Technical Notes**
- PDF folders in `data/` are reference-only, not processed
- All processing scripts must be run before building
- Dev server hot-reloads on file changes
- Production build includes automatic data processing

---

## 🚀 Deployment

### **Static Hosting (Recommended)**
The dashboard builds to static HTML/CSS/JS and can be deployed to:
- **Vercel** (recommended) — Automatic deployments from Git
- **Netlify** — Drag & drop or Git integration
- **GitHub Pages** — Free hosting for public repos
- **Any static host** — Cloudflare Pages, AWS S3, etc.

### **Build Command**
```bash
npm run build
```
Output: `dist/` folder with all static assets

---

## 📝 License

Created for **Data Challenge 5.0 — Sustainable Well-Being** using public data from Malaysian government sources.

---

## 🙏 Acknowledgments

- **Department of Statistics Malaysia (DOSM)** via [OpenDOSM](https://open.dosm.gov.my/)
- **Ministry of Higher Education (MOHE)** — Graduate Tracer Study data
- **Economic Planning Unit (EPU)** — Malaysian Well-Being Index
- **Data Challenge 5.0 Organizers**

---

## 📞 Support

For issues, questions, or contributions:
- Open a [GitHub Issue](https://github.com/mikailadham/Education-Employment-Outcomes-in-Malaysia/issues)
- Repository: [mikailadham/Education-Employment-Outcomes-in-Malaysia](https://github.com/mikailadham/Education-Employment-Outcomes-in-Malaysia)

---

**Last Updated**: March 2026
**Dashboard Status**: ✅ **Production-Ready** — 8 sections, 24+ visualizations, comprehensive analytics

Built with ❤️ for Data Challenge 5.0 🇲🇾
