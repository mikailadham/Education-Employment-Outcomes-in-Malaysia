"""
Extract Graduates Statistics by State from Statistik Siswazah 2024
Pulls graduate numbers, labor force participation, employment by state
"""

import pdfplumber
import pandas as pd
from pathlib import Path
import re

OUTPUT_DIR = Path("data/PDF_EXTRACTS")
OUTPUT_DIR.mkdir(exist_ok=True)


def clean_cell(text):
    """Clean cell text"""
    if text is None:
        return ""
    return str(text).strip().replace('\n', ' ')


def clean_number(value):
    """Clean numeric values (in thousands)"""
    if pd.isna(value) or value == '':
        return None
    if isinstance(value, str):
        # Remove non-numeric characters except decimal point
        cleaned = re.sub(r'[^\d.]', '', value)
        try:
            # Values are in thousands
            return float(cleaned) * 1000 if cleaned else None
        except ValueError:
            return None
    return value


def extract_state_table(pdf_path, page_num, state_name):
    """Extract state statistics table"""

    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[page_num - 1]
        tables = page.extract_tables()

        if not tables:
            return None

        table = tables[0]  # First table on page
        cleaned = [[clean_cell(cell) for cell in row] for row in table]

        return cleaned


def extract_all_states():
    """Extract statistics for all states"""

    pdf_path = "data/GRADUATES_STATISTICS/1. Statistik Siswazah 2024.pdf"

    # State names and their starting page numbers (based on exploration)
    states_pages = [
        ("Johor", 107),
        ("Kedah", 109),
        ("Kelantan", 111),
        ("Melaka", 113),
        ("Negeri Sembilan", 115),
        ("Pahang", 117),
        ("Pulau Pinang", 119),
        ("Perak", 121),
        ("Perlis", 123),
        ("Selangor", 125),
        ("Terengganu", 127),
        ("Sabah", 129),
        ("Sarawak", 131),
        ("WP Kuala Lumpur", 133),
        ("WP Labuan", 135),
        ("WP Putrajaya", 137)
    ]

    all_data = []

    print(f"\n{'='*80}")
    print(f"EXTRACTING: Graduates Statistics by State")
    print(f"{'='*80}\n")

    for state, page in states_pages:
        print(f"Extracting: {state} (page {page})")

        table = extract_state_table(pdf_path, page, state)

        if table and len(table) > 1:
            # Parse the table structure
            # Row 0: Headers (Statistik Utama, years)
            # Rows 1+: Data rows

            headers = table[0]
            years = [h for h in headers if h and re.match(r'^\d{4}$', h)]

            if not years:
                # Try to find years in the header row
                for row in table[:3]:
                    for cell in row:
                        if cell and re.match(r'^\d{4}$', cell):
                            years.append(cell)
                years = list(set(years))
                years.sort()

            # Extract data rows
            for row in table[1:]:
                if row and len(row) > 0:
                    metric = row[0]

                    # Skip empty or header-like rows
                    if not metric or metric in ['Statistik Utama', 'Principal Statistics', '']:
                        continue

                    # Extract values for each year
                    values = {}
                    for i, year in enumerate(years):
                        # Values typically start from column 2 onwards
                        if len(row) > i + 2:
                            val = row[i + 2]
                            values[year] = clean_number(val)

                    # Add to dataset
                    for year, value in values.items():
                        all_data.append({
                            'state': state,
                            'year': int(year),
                            'metric': metric.replace('\n', ' ').strip(),
                            'value': value
                        })

    # Convert to DataFrame
    df = pd.DataFrame(all_data)

    # Save raw extract
    output_path = OUTPUT_DIR / "graduates_by_state_2020_2024_raw.csv"
    df.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"\n[OK] Saved: {output_path}")
    print(f"     Rows: {len(df)}")
    print(f"     States: {df['state'].nunique()}")
    print(f"     Years: {sorted(df['year'].unique())}")
    print(f"     Metrics: {df['metric'].nunique()}")

    return df


def pivot_and_clean_data(df):
    """Pivot and clean the extracted data"""

    print(f"\nCleaning and pivoting data...")

    # Filter for most important metrics
    key_metrics = df['metric'].unique()
    print(f"\nAvailable metrics:")
    for i, metric in enumerate(key_metrics, 1):
        print(f"  {i}. {metric}")

    # Create separate datasets for different metrics
    # For now, save in wide format with metrics as columns

    # Pivot: rows=state+year, columns=metric
    df_pivot = df.pivot_table(
        index=['state', 'year'],
        columns='metric',
        values='value',
        aggfunc='first'
    ).reset_index()

    # Save
    output_path = OUTPUT_DIR / "graduates_by_state_2020_2024_clean.csv"
    df_pivot.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"\n[OK] Saved: {output_path}")
    print(f"     Rows: {len(df_pivot)}")

    return df_pivot


def main():
    # Extract all states
    df = extract_all_states()

    # Clean and pivot
    df_clean = pivot_and_clean_data(df)

    print(f"\n{'='*80}")
    print("[SUCCESS] Graduates statistics extraction complete!")
    print(f"{'='*80}\n")

    # Preview
    print("Sample data (Johor 2024):")
    print("-"*80)
    sample = df_clean[(df_clean['state'] == 'Johor') & (df_clean['year'] == 2024)]
    if not sample.empty:
        print(sample.head().to_string(index=False))


if __name__ == "__main__":
    main()
