"""
Extract Graduates Statistics for all available years (2021, 2022)
State-level data extraction
"""

import pdfplumber
import pandas as pd
from pathlib import Path
import re

OUTPUT_DIR = Path("data/PDF_EXTRACTS")


def clean_cell(text):
    if text is None:
        return ""
    return str(text).strip().replace('\n', ' ')


def clean_number(value):
    if pd.isna(value) or value == '':
        return None
    if isinstance(value, str):
        cleaned = re.sub(r'[^\d.]', '', value)
        try:
            return float(cleaned) * 1000 if cleaned else None
        except ValueError:
            return None
    return value


def extract_state_graduates(year, pdf_path, start_page=106):
    """Extract state-level graduate statistics for a given year"""

    states_pages = [
        ("Johor", start_page),
        ("Kedah", start_page + 2),
        ("Kelantan", start_page + 4),
        ("Melaka", start_page + 6),
        ("Negeri Sembilan", start_page + 8),
        ("Pahang", start_page + 10),
        ("Pulau Pinang", start_page + 12),
        ("Perak", start_page + 14),
        ("Perlis", start_page + 16),
        ("Selangor", start_page + 18),
        ("Terengganu", start_page + 20),
        ("Sabah", start_page + 22),
        ("Sarawak", start_page + 24),
        ("WP Kuala Lumpur", start_page + 26),
        ("WP Labuan", start_page + 28),
        ("WP Putrajaya", start_page + 30)
    ]

    all_data = []

    print(f"\nExtracting {year} (starting page {start_page})...")

    with pdfplumber.open(pdf_path) as pdf:
        for state, page_num in states_pages:
            if page_num > len(pdf.pages):
                print(f"  Skipping {state} - page {page_num} exceeds PDF length")
                continue

            page = pdf.pages[page_num - 1]
            tables = page.extract_tables()

            if not tables:
                continue

            table = tables[0]
            cleaned = [[clean_cell(cell) for cell in row] for row in table]

            if len(cleaned) > 1:
                # Find year columns in header
                headers = cleaned[0]
                year_cols = {}
                for i, h in enumerate(headers):
                    if h and re.match(r'^\d{4}$', h):
                        year_cols[h] = i

                # If year not in header, search first few rows
                if not year_cols:
                    for row_idx in range(min(3, len(cleaned))):
                        for col_idx, cell in enumerate(cleaned[row_idx]):
                            if cell and re.match(r'^\d{4}$', cell):
                                year_cols[cell] = col_idx

                # Check if our target year exists
                if str(year) in year_cols:
                    year_col = year_cols[str(year)]

                    # Extract "Jumlah Total" row (total graduates)
                    for row in cleaned[1:]:
                        if row and len(row) > 0:
                            metric = row[0]

                            # Look for total graduates row
                            if metric and 'Jumlah' in metric and 'Total' in metric:
                                if len(row) > year_col:
                                    value = clean_number(row[year_col])
                                    all_data.append({
                                        'state': state,
                                        'year': year,
                                        'total_graduates': value
                                    })
                                    break

    return pd.DataFrame(all_data)


def main():
    print(f"\n{'='*80}")
    print("EXTRACTING GRADUATES STATISTICS - ADDITIONAL YEARS")
    print(f"{'='*80}")

    all_dfs = []

    # Extract 2022
    pdf_2022 = "data/GRADUATES_STATISTICS/Statistik Siswazah 2022.pdf"
    df_2022 = extract_state_graduates(2022, pdf_2022, start_page=106)
    if not df_2022.empty:
        all_dfs.append(df_2022)
        print(f"  [OK] 2022: {len(df_2022)} states")

    # Extract 2021
    pdf_2021 = "data/GRADUATES_STATISTICS/Statistik Siswazah 2021.pdf"
    df_2021 = extract_state_graduates(2021, pdf_2021, start_page=106)
    if not df_2021.empty:
        all_dfs.append(df_2021)
        print(f"  [OK] 2021: {len(df_2021)} states")

    if all_dfs:
        # Combine with existing 2020-2024 data
        df_existing = pd.read_csv(OUTPUT_DIR / "graduates_by_state_2020_2024_clean.csv")

        # Add missing columns to new data
        for col in df_existing.columns:
            if col not in all_dfs[0].columns:
                for df in all_dfs:
                    df[col] = None

        # Combine all
        df_combined = pd.concat([df_existing] + all_dfs, ignore_index=True)
        df_combined = df_combined.sort_values(['state', 'year'])

        # Remove duplicates (keep existing data)
        df_combined = df_combined.drop_duplicates(subset=['state', 'year'], keep='first')

        # Save
        output_path = OUTPUT_DIR / "graduates_by_state_all_years.csv"
        df_combined.to_csv(output_path, index=False, encoding='utf-8-sig')

        print(f"\n[OK] Saved: {output_path}")
        print(f"     Total rows: {len(df_combined)}")
        print(f"     Years: {sorted(df_combined['year'].unique())}")
        print(f"     States: {df_combined['state'].nunique()}")

    print(f"\n{'='*80}")
    print("[SUCCESS] Additional years extraction complete!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
