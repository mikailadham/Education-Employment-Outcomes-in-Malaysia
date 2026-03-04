"""
PDF Explorer - Preview PDF structure and tables
Usage: python scripts/pdf-explorer.py "path/to/file.pdf"
"""

import sys
import pdfplumber

def explore_pdf(pdf_path, max_pages=10):
    """Explore PDF structure and preview tables"""

    print(f"\n{'='*80}")
    print(f"EXPLORING: {pdf_path}")
    print(f"{'='*80}\n")

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"Total pages: {total_pages}\n")

        # Limit exploration to first max_pages
        pages_to_explore = min(max_pages, total_pages)
        print(f"Exploring first {pages_to_explore} pages...\n")

        for page_num in range(pages_to_explore):
            page = pdf.pages[page_num]
            print(f"\n--- PAGE {page_num + 1} ---")

            # Extract text preview
            text = page.extract_text()
            if text:
                lines = text.split('\n')[:5]  # First 5 lines
                print("Text preview:")
                for line in lines:
                    print(f"  {line[:100]}")  # Limit line length
                print("  ...")

            # Find tables
            tables = page.extract_tables()
            if tables:
                print(f"\nFound {len(tables)} table(s) on this page")
                for i, table in enumerate(tables, 1):
                    if table:
                        rows = len(table)
                        cols = len(table[0]) if table else 0
                        print(f"  Table {i}: {rows} rows × {cols} columns")

                        # Preview first row (headers)
                        if table and table[0]:
                            print(f"    Headers: {table[0][:5]}")  # First 5 columns
            else:
                print("\nNo tables detected on this page")

            print("-" * 80)

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python scripts/pdf-explorer.py 'path/to/file.pdf'")
        print("\nAvailable PDFs:")
        print("  data/GRADUATES_STATISTICS/1. Statistik Siswazah 2024.pdf")
        print("  data/HIGHER_EDUCATION/Bab 7_Tracer Study 2024.pdf")
        sys.exit(1)

    pdf_file = sys.argv[1]
    explore_pdf(pdf_file)
