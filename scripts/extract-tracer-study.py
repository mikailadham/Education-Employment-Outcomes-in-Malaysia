"""
Extract Graduate Tracer Study Data - Targeted Extraction
Pulls employment rate data by field, level, and state
"""

import pdfplumber
import pandas as pd
from pathlib import Path

OUTPUT_DIR = Path("data/PDF_EXTRACTS")
OUTPUT_DIR.mkdir(exist_ok=True)


def clean_cell(text):
    """Clean cell text"""
    if text is None:
        return ""
    return str(text).strip().replace('\n', ' ')


def extract_and_save_table(pdf_path, page_num, table_index, output_name, year):
    """Extract specific table and save to CSV"""

    with pdfplumber.open(pdf_path) as pdf:
        page = pdf.pages[page_num - 1]  # Convert to 0-indexed
        tables = page.extract_tables()

        if table_index >= len(tables):
            print(f"[ERROR] Table {table_index} not found on page {page_num}")
            return None

        table = tables[table_index]

        # Clean the data
        cleaned = [[clean_cell(cell) for cell in row] for row in table]

        # Create DataFrame
        df = pd.DataFrame(cleaned[1:], columns=cleaned[0])

        # Remove empty rows
        df = df.replace('', pd.NA).dropna(how='all')

        # Add year column
        df.insert(0, 'year', year)

        # Save
        output_path = OUTPUT_DIR / output_name
        df.to_csv(output_path, index=False, encoding='utf-8-sig')

        print(f"[OK] Extracted: {output_name}")
        print(f"  Rows: {len(df)}, Columns: {len(df.columns)}")
        print(f"  Preview: {list(df.columns)[:5]}")
        print()

        return df


def extract_tracer_study_2024():
    """Extract all priority tables from Tracer Study 2024"""

    pdf_path = "data/HIGHER_EDUCATION/Bab 7_Tracer Study 2024.pdf"
    year = 2024

    print(f"\n{'='*80}")
    print(f"EXTRACTING: Graduate Tracer Study {year}")
    print(f"{'='*80}\n")

    # Table 7.4 - Employment by Field of Study (Page 5)
    extract_and_save_table(
        pdf_path,
        page_num=5,
        table_index=1,  # Second table on page
        output_name=f"tracer_employment_by_field_{year}.csv",
        year=year
    )

    # Table 7.5 - Employment by Level of Study (Page 6)
    extract_and_save_table(
        pdf_path,
        page_num=6,
        table_index=1,
        output_name=f"tracer_employment_by_level_{year}.csv",
        year=year
    )

    # Table 7.6 - Employment by State (Page 7) ** KEY FOR MAP **
    extract_and_save_table(
        pdf_path,
        page_num=7,
        table_index=1,
        output_name=f"tracer_employment_by_state_{year}.csv",
        year=year
    )

    # Table 7.7 - Employment Status/Type (Page 8)
    extract_and_save_table(
        pdf_path,
        page_num=8,
        table_index=1,
        output_name=f"tracer_employment_type_{year}.csv",
        year=year
    )

    print("[SUCCESS] Tracer Study 2024 extraction complete!")
    print(f"Files saved to: {OUTPUT_DIR}")


if __name__ == "__main__":
    extract_tracer_study_2024()
