# Malaysia Education & Employment Dashboard

An interactive web dashboard visualizing Malaysia's education and employment outcomes using official DOSM datasets for **Data Challenge 5.0** themed on sustainable well-being.

## 🎯 Features

- **Interactive SVG Map of Malaysia** — Hover over states to see metrics, click for detailed views
- **Metric Switching** — Toggle between GDP, income, Gini coefficient, unemployment, participation rate, and school completion
- **Choropleth Visualization** — Color-coded states based on selected metric intensity
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile
- **Static Site Generation** — Fast, deployable to any static hosting (Vercel, Netlify, GitHub Pages)
- **Clean Data Pipeline** — Automated CSV processing with deduplication and standardization

## 🛠 Tech Stack

- **Framework**: Astro 5 (SSG/static mode)
- **UI Library**: React 19 (for interactive islands)
- **Styling**: Tailwind CSS 4
- **Charts**: Recharts
- **Data Processing**: Node.js with Papaparse
- **Deployment**: Static output via `astro build`

## 📊 Data Sources

All data from [OpenDOSM](https://open.dosm.gov.my/) (Department of Statistics Malaysia):

- **Labour Force Survey (LFS)** — Annual, quarterly, and monthly employment statistics
- **GDP by State** — Economic output by sector at constant 2015 prices
- **Household Income & Inequality** — Mean, median income, and Gini coefficients
- **Education Statistics** — School completion, enrolment, teachers, and university lecturers

## 🚀 Getting Started

### Prerequisites

- Node.js 24.x or later
- npm 11.x or later

### Installation

1. **Navigate to the project directory**:
   ```bash
   cd "C:\Users\User\Desktop\Data celen"
   ```

2. **Install dependencies** (if not already done):
   ```bash
   npm install
   ```

3. **Process data** (converts CSV files to JSON):
   ```bash
   npm run process-data
   ```
   This scans all CSVs in `data/`, removes duplicates, standardizes state names, and outputs structured JSON files to `src/data/`.

4. **Start development server**:
   ```bash
   npm run dev
   ```
   Dashboard available at `http://localhost:4321` (or next available port).

5. **Build for production**:
   ```bash
   npm run build
   ```
   Static files generated in `dist/` folder.

6. **Preview production build**:
   ```bash
   npm run preview
   ```

## 📁 Project Structure

```
/
├── data/                              # Raw CSV files
│   ├── ANNUAL_LFS/
│   ├── ECONOMIC_CONTEXT/
│   ├── EDUCATION/
│   ├── LABOUR_PRODUCTIVITY/
│   ├── MONTHLY_SERIES/
│   └── QUARTERLY_SERIES/
│
├── scripts/
│   └── process-data.js                # Data discovery, cleaning, JSON output
│
├── src/
│   ├── components/
│   │   ├── MalaysiaMap.jsx            # Interactive SVG map with choropleth ✅
│   │   ├── MapTooltip.jsx             # Hover tooltip ✅
│   │   ├── MetricTabs.jsx             # Metric switcher ✅
│   │   ├── ColorLegend.jsx            # Color scale legend ✅
│   │   └── ...                        # (TODO) Chart components
│   │
│   ├── data/                          # Generated JSON files
│   │   ├── economic/
│   │   ├── labour/
│   │   ├── education/
│   │   └── summary-by-state.json      # Merged latest data for map
│   │
│   ├── layouts/
│   │   └── Layout.astro               # Main layout with fonts & footer
│   │
│   ├── pages/
│   │   ├── index.astro                # Main dashboard ✅
│   │   └── about.astro                # (TODO)
│   │
│   └── styles/
│       └── global.css                 # Tailwind + custom animations
│
├── astro.config.mjs
├── package.json
└── README.md
```

## 🗺️ How It Works

### Data Processing

1. **Discovery**: `process-data.js` scans CSVs, identifies duplicates (e.g., `file (1).csv`)
2. **Cleaning**: Standardizes state names, parses dates, converts numbers, maps codes to labels
3. **Output**: Structured JSON files in `src/data/` for each category

### Interactive Map

- SVG `<path>` elements for all 16 states/FTs
- Metric tabs to switch visualization focus
- Real-time choropleth coloring with sequential scales
- Hover tooltips showing all metrics
- Click to reveal state detail (when implemented)

## 📈 Metrics Explained

- **Unemployment Rate** — % of labour force seeking work
- **Labour Force Participation Rate** — % of working-age population in labour force
- **Gini Coefficient** — Income inequality (0 = perfect equality, 1 = perfect inequality)
- **School Completion Rate** — % completing primary/lower/upper secondary
- **GDP Total** — Gross Domestic Product at constant 2015 prices (RM billions)
- **Mean/Median Income** — Household income in RM

## 🎨 Design

Editorial data journalism aesthetic:
- Clean layout, generous whitespace
- Typography: Plus Jakarta Sans
- Colors: Navy/charcoal with teal accents
- Smooth transitions and animations
- Mobile-first responsive

## ⚠️ Notes

- **PDF folders** are reference-only, not processed
- **Data years** vary (2022-2023 latest)
- **Missing data** shows as "N/A" or gray on map
- **Supranational** entities excluded from state visualizations

## 🚧 Progress

✅ **Completed**:
- [x] Astro 5 + React + Tailwind CSS 4 setup
- [x] Data discovery and processing pipeline
- [x] Interactive Malaysia SVG map
- [x] Choropleth visualization
- [x] Metric switching tabs
- [x] Hover tooltips with all metrics
- [x] Color legend
- [x] Hero section and layout
- [x] National summary cards placeholder

🔨 **In Progress / TODO**:
- [ ] State detail panel with time-series charts
- [ ] Education metric charts
- [ ] Economic context charts (GDP, income, Gini)
- [ ] National trends section
- [ ] Full design system polish
- [ ] About/methodology page
- [ ] Testing and bug fixes

## 📝 License

Created for **Data Challenge 5.0** using public data from OpenDOSM.

## 🙏 Acknowledgments

- **Department of Statistics Malaysia (DOSM)** via [OpenDOSM](https://open.dosm.gov.my/)
- **Data Challenge 5.0 — Sustainable Well-Being**

---

**Dashboard Status**: 🚧 **50% Complete** — Core map functionality done, chart components pending

For questions, open a GitHub issue or contact the team.
