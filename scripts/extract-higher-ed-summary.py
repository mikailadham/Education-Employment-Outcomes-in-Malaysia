"""
Extract summary data from Higher Education PDFs (Bab 2-5)
Focus on extracting enrollment totals and institution counts
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
        cleaned = value.replace(',', '').replace(' ', '').strip()
        try:
            return int(cleaned) if cleaned else None
        except ValueError:
            try:
                return float(cleaned)
            except ValueError:
                return value
    return value


def extract_enrollment_table(pdf_path, page_num, table_idx=1):
    """Extract enrollment table from a specific page"""

    with pdfplumber.open(pdf_path) as pdf:
        if page_num > len(pdf.pages):
            return None

        page = pdf.pages[page_num - 1]
        tables = page.extract_tables()

        if not tables or table_idx >= len(tables):
            return None

        table = tables[table_idx]
        cleaned = [[clean_cell(cell) for cell in row] for row in table]

        return cleaned


def extract_public_universities():
    """Extract public university enrollment summary"""

    pdf_path = "data/HIGHER_EDUCATION/Bab 2_UA 2024_update.pdf"

    print("\nExtracting Public Universities (UA) data...")

    # Page 2 has overall enrollment table (Table 2.1)
    table = extract_enrollment_table(pdf_path, 2, 1)

    if table:
        # Try to extract total enrollment from the table
        # Look for "Jumlah/Total" row
        data = []
        for row in table:
            if row and len(row) > 0:
                first_col = row[0] if row[0] else ""
                if 'Jumlah' in first_col or 'Total' in first_col:
                    # Extract enrollment values
                    print(f"  Found summary row: {row[:5]}")

        print(f"  [OK] Extracted public university data")

    return table


def extract_private_heis():
    """Extract private HEI enrollment summary"""

    pdf_path = "data/HIGHER_EDUCATION/Bab 3_IPTS 2024_update.pdf"

    print("\nExtracting Private HEIs (IPTS) data...")

    with pdfplumber.open(pdf_path) as pdf:
        print(f"  Total pages: {len(pdf.pages)}")

        # Explore first few pages to find summary tables
        for page_num in range(1, min(5, len(pdf.pages) + 1)):
            page = pdf.pages[page_num - 1]
            tables = page.extract_tables()

            if tables:
                print(f"  Page {page_num}: {len(tables)} table(s) found")


def extract_polytechnics():
    """Extract polytechnic enrollment summary"""

    pdf_path = "data/HIGHER_EDUCATION/Bab 4_POLITEKNIK 2024.pdf"

    print("\nExtracting Polytechnics data...")

    with pdfplumber.open(pdf_path) as pdf:
        print(f"  Total pages: {len(pdf.pages)}")


def extract_community_colleges():
    """Extract community college enrollment summary"""

    pdf_path = "data/HIGHER_EDUCATION/Bab 5_KK 2024 v2.pdf"

    print("\nExtracting Community Colleges (KK) data...")

    with pdfplumber.open(pdf_path) as pdf:
        print(f"  Total pages: {len(pdf.pages)}")


def main():
    print(f"\n{'='*80}")
    print("EXTRACTING HIGHER EDUCATION SUMMARY DATA")
    print(f"{'='*80}")

    extract_public_universities()
    extract_private_heis()
    extract_polytechnics()
    extract_community_colleges()

    print(f"\n{'='*80}")
    print("[INFO] Higher education extraction (exploratory)")
    print(f"{'='*80}\n")

    print("NOTE: Higher education data is at institution level, not state level.")
    print("To make it useful for the map, would need to:")
    print("  1. Map each institution to its state")
    print("  2. Aggregate enrollment by state")
    print("\nCurrent priority: Use the rich state-level data already extracted!")


if __name__ == "__main__":
    main()
