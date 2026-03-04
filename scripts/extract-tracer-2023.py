"""
Extract Graduate Tracer Study 2023
Same structure as 2024
"""

import pdfplumber
import pandas as pd
from pathlib import Path

OUTPUT_DIR = Path("data/PDF_EXTRACTS")


def clean_cell(text):
    if text is None:
        return ""
    return str(text).strip().replace('\n', ' ')


def extract_and_save_table(pdf_path, page_num, table_index, output_name, year):
    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[page_num - 1]
        tables = page.extract_tables()

        if table_index >= len(tables):
            print(f"[ERROR] Table {table_index} not found on page {page_num}")
            return None

        table = tables[table_index]
        cleaned = [[clean_cell(cell) for cell in row] for row in table]
        df = pd.DataFrame(cleaned[1:], columns=cleaned[0])
        df = df.replace('', pd.NA).dropna(how='all')
        df.insert(0, 'year', year)

        output_path = OUTPUT_DIR / output_name
        df.to_csv(output_path, index=False, encoding='utf-8-sig')

        print(f"[OK] {output_name}")
        print(f"     Rows: {len(df)}, Columns: {len(df.columns)}")
        return df


def main():
    pdf_path = "data/HIGHER_EDUCATION/Bab 7_Tracer Study 2023.pdf"
    year = 2023

    print(f"\n{'='*80}")
    print(f"EXTRACTING: Graduate Tracer Study {year}")
    print(f"{'='*80}\n")

    # Based on 2024 structure, should be similar pages
    # Need to verify page numbers for 2023

    extract_and_save_table(pdf_path, 5, 1, f"tracer_employment_by_field_{year}.csv", year)
    extract_and_save_table(pdf_path, 6, 1, f"tracer_employment_by_level_{year}.csv", year)
    extract_and_save_table(pdf_path, 7, 1, f"tracer_employment_by_state_{year}.csv", year)
    extract_and_save_table(pdf_path, 8, 1, f"tracer_employment_type_{year}.csv", year)

    print(f"\n{'='*80}")
    print(f"[SUCCESS] Tracer Study {year} extraction complete!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
