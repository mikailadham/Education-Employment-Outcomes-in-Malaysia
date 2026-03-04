"""
PDF Data Extractor - Extract tables from PDFs to CSV
Usage: python scripts/pdf-extractor.py
"""

import pdfplumber
import pandas as pd
from pathlib import Path
import re

# Output directory
OUTPUT_DIR = Path("data/PDF_EXTRACTS")
OUTPUT_DIR.mkdir(exist_ok=True)


def clean_text(text):
    """Clean extracted text"""
    if text is None:
        return ""
    return str(text).strip().replace('\n', ' ')


def extract_tables_from_pdf(pdf_path, pages=None, table_settings=None):
    """
    Extract tables from PDF pages

    Args:
        pdf_path: Path to PDF file
        pages: List of page numbers (1-indexed) or None for all pages
        table_settings: Dict of pdfplumber table extraction settings
    """
    tables_data = []

    with pdfplumber.open(pdf_path) as pdf:
        page_range = pages if pages else range(1, len(pdf.pages) + 1)

        for page_num in page_range:
            page = pdf.pages[page_num - 1]  # Convert to 0-indexed
            tables = page.extract_tables(table_settings or {})

            for table_idx, table in enumerate(tables):
                if table:
                    # Clean the table data
                    cleaned_table = [[clean_text(cell) for cell in row] for row in table]
                    tables_data.append({
                        'page': page_num,
                        'table_index': table_idx,
                        'data': cleaned_table
                    })

    return tables_data


def save_table_to_csv(table_data, output_path, has_header=True):
    """Save extracted table to CSV"""
    data = table_data['data']

    if has_header and len(data) > 1:
        df = pd.DataFrame(data[1:], columns=data[0])
    else:
        df = pd.DataFrame(data)

    # Remove completely empty rows
    df = df.replace('', pd.NA).dropna(how='all')

    df.to_csv(output_path, index=False, encoding='utf-8-sig')
    print(f"✓ Saved: {output_path} ({len(df)} rows)")


# ============================================================================
# EXTRACTION FUNCTIONS FOR EACH PDF TYPE
# ============================================================================

def extract_graduates_statistics(year):
    """Extract data from Statistik Siswazah PDFs"""
    print(f"\n{'='*80}")
    print(f"EXTRACTING: Graduates Statistics {year}")
    print(f"{'='*80}\n")

    # Map year to filename
    files = {
        2024: "data/GRADUATES_STATISTICS/1. Statistik Siswazah 2024.pdf",
        2023: "data/GRADUATES_STATISTICS/Penerbitan Statistik Siswazah 2023.pdf",
        2022: "data/GRADUATES_STATISTICS/Statistik Siswazah 2022.pdf",
        2021: "data/GRADUATES_STATISTICS/Statistik Siswazah 2021.pdf"
    }

    if year not in files:
        print(f"Error: No file found for year {year}")
        return

    pdf_path = files[year]

    # First, explore the PDF to understand structure
    print(f"Tip: Run the explorer first to identify which pages contain the tables you need:")
    print(f"  python scripts/pdf-explorer.py \"{pdf_path}\"\n")

    # Example extraction (customize based on PDF structure)
    # You'll need to identify the specific pages after exploring
    print("Manual extraction required:")
    print("1. Run pdf-explorer.py to find relevant tables")
    print("2. Note page numbers and table indices")
    print("3. Use extract_tables_from_pdf() with specific pages")
    print("\nExample code:")
    print(f"""
    tables = extract_tables_from_pdf("{pdf_path}", pages=[5, 6, 7])
    for i, table in enumerate(tables):
        save_table_to_csv(table, OUTPUT_DIR / f"graduates_{year}_table_{i}.csv")
    """)


def extract_tracer_study(year):
    """Extract Graduate Tracer Study data - HIGHEST PRIORITY"""
    print(f"\n{'='*80}")
    print(f"EXTRACTING: Graduate Tracer Study {year}")
    print(f"{'='*80}\n")

    files = {
        2024: "data/HIGHER_EDUCATION/Bab 7_Tracer Study 2024.pdf",
        2023: "data/HIGHER_EDUCATION/Bab 7_Tracer Study 2023.pdf"
    }

    if year not in files:
        print(f"Error: No file found for year {year}")
        return

    pdf_path = files[year]

    print("Priority data to extract:")
    print("  1. Employment rate by field of study")
    print("  2. Average starting salary by field")
    print("  3. Job relevance (% working in related field)")
    print("  4. Time to employment")
    print("  5. Unemployment rate among graduates\n")

    print(f"Run explorer first:")
    print(f"  python scripts/pdf-explorer.py \"{pdf_path}\"\n")


def extract_custom_pages(pdf_path, pages, output_name):
    """
    Generic function to extract specific pages

    Args:
        pdf_path: Path to PDF
        pages: List of page numbers (e.g., [3, 4, 5])
        output_name: Base name for output files
    """
    print(f"\nExtracting from {pdf_path}")
    print(f"Pages: {pages}\n")

    tables = extract_tables_from_pdf(pdf_path, pages=pages)

    for i, table in enumerate(tables):
        output_file = OUTPUT_DIR / f"{output_name}_p{table['page']}_t{table['table_index']}.csv"
        save_table_to_csv(table, output_file)

    print(f"\n✓ Extracted {len(tables)} table(s)")


# ============================================================================
# MAIN MENU
# ============================================================================

def main():
    print("\n" + "="*80)
    print("PDF DATA EXTRACTOR")
    print("="*80)

    print("\nQuick Start Guide:")
    print("-" * 80)
    print("\n1. EXPLORE PDFs first to identify table locations:")
    print("   python scripts/pdf-explorer.py 'data/GRADUATES_STATISTICS/1. Statistik Siswazah 2024.pdf'")

    print("\n2. EXTRACT specific tables using this script:")
    print("   - Modify the extraction functions below")
    print("   - Specify exact page numbers and table indices")

    print("\n3. Example: Extract tables from pages 10-15 of Tracer Study:")
    print("""
from scripts.pdf_extractor import extract_custom_pages

extract_custom_pages(
    pdf_path="data/HIGHER_EDUCATION/Bab 7_Tracer Study 2024.pdf",
    pages=[10, 11, 12, 13, 14, 15],
    output_name="tracer_2024_employment"
)
    """)

    print("\n" + "="*80)
    print("\nTip: This is a helper script. You'll need to:")
    print("  • Explore each PDF to find relevant tables")
    print("  • Write custom extraction code for each data type")
    print("  • Clean and merge the extracted CSVs as needed")
    print("\nThe PDF structure varies, so manual identification is required.")
    print("="*80 + "\n")


if __name__ == "__main__":
    main()
