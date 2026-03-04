"""
Extract Graduates Statistics 2022 and 2023
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


def extract_state_table(pdf_path, page_num):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[page_num - 1]
        tables = page.extract_tables()
        if not tables:
            return None
        table = tables[0]
        cleaned = [[clean_cell(cell) for cell in row] for row in table]
        return cleaned


def extract_graduates_by_year(year):
    """Extract graduates statistics for a specific year"""

    files = {
        2023: "data/GRADUATES_STATISTICS/Penerbitan Statistik Siswazah 2023.pdf",
        2022: "data/GRADUATES_STATISTICS/Statistik Siswazah 2022.pdf",
        2021: "data/GRADUATES_STATISTICS/Statistik Siswazah 2021.pdf"
    }

    if year not in files:
        print(f"No file for year {year}")
        return None

    pdf_path = files[year]

    # State page mappings (may vary by year, these are estimates)
    # Based on 2024 structure
    states_pages = [
        ("Johor", 107), ("Kedah", 109), ("Kelantan", 111),
        ("Melaka", 113), ("Negeri Sembilan", 115), ("Pahang", 117),
        ("Pulau Pinang", 119), ("Perak", 121), ("Perlis", 123),
        ("Selangor", 125), ("Terengganu", 127), ("Sabah", 129),
        ("Sarawak", 131), ("WP Kuala Lumpur", 133),
        ("WP Labuan", 135), ("WP Putrajaya", 137)
    ]

    all_data = []

    print(f"\n{'='*80}")
    print(f"EXTRACTING: Graduates Statistics {year}")
    print(f"{'='*80}\n")

    for state, page in states_pages:
        print(f"Extracting: {state} (page {page})")

        table = extract_state_table(pdf_path, page)

        if table and len(table) > 1:
            headers = table[0]
            years_in_table = [h for h in headers if h and re.match(r'^\d{4}$', h)]

            if not years_in_table:
                for row in table[:3]:
                    for cell in row:
                        if cell and re.match(r'^\d{4}$', cell):
                            years_in_table.append(cell)
                years_in_table = list(set(years_in_table))
                years_in_table.sort()

            # For this year, only extract the specific year's data
            if str(year) in years_in_table:
                year_index = years_in_table.index(str(year))

                for row in table[1:]:
                    if row and len(row) > 0:
                        metric = row[0]

                        if not metric or metric in ['Statistik Utama', 'Principal Statistics', '']:
                            continue

                        if len(row) > year_index + 2:
                            val = row[year_index + 2]
                            all_data.append({
                                'state': state,
                                'year': year,
                                'metric': metric.replace('\n', ' ').strip(),
                                'value': clean_number(val)
                            })

    df = pd.DataFrame(all_data)

    # Pivot
    df_pivot = df.pivot_table(
        index=['state', 'year'],
        columns='metric',
        values='value',
        aggfunc='first'
    ).reset_index()

    output_path = OUTPUT_DIR / f"graduates_by_state_{year}.csv"
    df_pivot.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"\n[OK] Saved: {output_path}")
    print(f"     Rows: {len(df_pivot)}")

    return df_pivot


def main():
    # Extract 2022 and 2023
    extract_graduates_by_year(2023)
    extract_graduates_by_year(2022)

    print(f"\n{'='*80}")
    print("[SUCCESS] Graduates statistics extraction complete!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
