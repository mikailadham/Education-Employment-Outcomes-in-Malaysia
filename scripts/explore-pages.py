"""
Explore specific page ranges of a PDF
Usage: python scripts/explore-pages.py "path/to/file.pdf" start_page end_page
"""

import sys
import pdfplumber

def explore_pages(pdf_path, start_page, end_page):
    """Explore specific page range"""

    with pdfplumber.open(pdf_path) as pdf:
        total_pages = len(pdf.pages)
        print(f"\n{'='*80}")
        print(f"EXPLORING: {pdf_path}")
        print(f"Total pages: {total_pages}")
        print(f"Showing pages {start_page}-{end_page}")
        print(f"{'='*80}\n")

        for page_num in range(start_page - 1, min(end_page, total_pages)):
            page = pdf.pages[page_num]
            print(f"\n--- PAGE {page_num + 1} ---")

            # Extract text preview
            text = page.extract_text()
            if text:
                lines = text.split('\n')[:8]  # First 8 lines
                for line in lines:
                    # Handle unicode for Windows console
                    try:
                        print(f"  {line[:120]}")
                    except UnicodeEncodeError:
                        print(f"  {line[:120].encode('ascii', 'replace').decode('ascii')}")

            # Find tables
            tables = page.extract_tables()
            if tables:
                print(f"\n  >> {len(tables)} table(s) found")
                for i, table in enumerate(tables, 1):
                    if table and len(table) > 1:
                        rows = len(table)
                        cols = len(table[0]) if table else 0
                        print(f"     Table {i}: {rows} rows x {cols} cols")
                        if table[0]:
                            print(f"     Header: {' | '.join(str(h)[:30] for h in table[0][:4])}")
            print("-" * 80)


if __name__ == "__main__":
    if len(sys.argv) < 4:
        print("Usage: python scripts/explore-pages.py 'path/to/file.pdf' start_page end_page")
        sys.exit(1)

    pdf_file = sys.argv[1]
    start = int(sys.argv[2])
    end = int(sys.argv[3])

    explore_pages(pdf_file, start, end)
