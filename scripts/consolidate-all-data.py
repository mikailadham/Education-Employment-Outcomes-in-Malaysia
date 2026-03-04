"""
Consolidate all extracted PDF data into final analysis-ready datasets
"""

import pandas as pd
from pathlib import Path

INPUT_DIR = Path("data/PDF_EXTRACTS")
OUTPUT_DIR = INPUT_DIR


def consolidate_tracer_state_data():
    """Combine 2023 and 2024 state-level employment data"""
    print("Consolidating state-level employment data...")

    # Load both years
    df_2024 = pd.read_csv(INPUT_DIR / "tracer_employment_by_state_2024_clean.csv")
    df_2023 = pd.read_csv(INPUT_DIR / "tracer_employment_by_state_2023_clean.csv")

    # Align columns (2024 has fewer columns)
    # For 2024, create the missing columns with NaN
    for col in df_2023.columns:
        if col not in df_2024.columns:
            df_2024[col] = None

    # Reorder columns to match
    df_2024 = df_2024[df_2023.columns]

    # Combine
    df_combined = pd.concat([df_2023, df_2024], ignore_index=True)
    df_combined = df_combined.sort_values(['state', 'year'])

    output_path = OUTPUT_DIR / "tracer_employment_by_state_2023_2024.csv"
    df_combined.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] {output_path}")
    print(f"     Rows: {len(df_combined)} ({len(df_2023)} from 2023, {len(df_2024)} from 2024)")
    print(f"     States: {df_combined['state'].nunique()}")
    print()

    return df_combined


def consolidate_tracer_field_data():
    """Combine 2023 and 2024 field-level employment data"""
    print("Consolidating field-level employment data...")

    df_2024 = pd.read_csv(INPUT_DIR / "tracer_employment_by_field_2024_clean.csv")
    df_2023 = pd.read_csv(INPUT_DIR / "tracer_employment_by_field_2023_clean.csv")

    for col in df_2023.columns:
        if col not in df_2024.columns:
            df_2024[col] = None

    df_2024 = df_2024[df_2023.columns]

    df_combined = pd.concat([df_2023, df_2024], ignore_index=True)
    df_combined = df_combined.sort_values(['field_of_study', 'year'])

    output_path = OUTPUT_DIR / "tracer_employment_by_field_2023_2024.csv"
    df_combined.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] {output_path}")
    print(f"     Rows: {len(df_combined)}")
    print(f"     Fields: {df_combined['field_of_study'].nunique()}")
    print()

    return df_combined


def consolidate_tracer_level_data():
    """Combine 2023 and 2024 level-of-study employment data"""
    print("Consolidating level-of-study employment data...")

    df_2024 = pd.read_csv(INPUT_DIR / "tracer_employment_by_level_2024_clean.csv")
    df_2023 = pd.read_csv(INPUT_DIR / "tracer_employment_by_level_2023_clean.csv")

    for col in df_2023.columns:
        if col not in df_2024.columns:
            df_2024[col] = None

    df_2024 = df_2024[df_2023.columns]

    df_combined = pd.concat([df_2023, df_2024], ignore_index=True)
    df_combined = df_combined.sort_values(['level_of_study', 'year'])

    output_path = OUTPUT_DIR / "tracer_employment_by_level_2023_2024.csv"
    df_combined.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] {output_path}")
    print(f"     Rows: {len(df_combined)}")
    print(f"     Levels: {df_combined['level_of_study'].nunique()}")
    print()

    return df_combined


def create_summary_report():
    """Generate summary statistics"""
    print("\n" + "="*80)
    print("DATA EXTRACTION SUMMARY")
    print("="*80 + "\n")

    # Count files
    all_files = list(INPUT_DIR.glob("*.csv"))
    clean_files = list(INPUT_DIR.glob("*_clean.csv"))

    print(f"Total CSV files: {len(all_files)}")
    print(f"Cleaned files: {len(clean_files)}")
    print()

    # Load key datasets and show stats
    print("KEY DATASETS:")
    print("-"*80)

    datasets = [
        ("tracer_employment_by_state_2023_2024.csv", "Graduate Employment by State (2023-2024)"),
        ("tracer_employment_by_field_2023_2024.csv", "Graduate Employment by Field (2023-2024)"),
        ("tracer_employment_by_level_2023_2024.csv", "Graduate Employment by Level (2023-2024)"),
        ("graduates_by_state_2020_2024_clean.csv", "Total Graduates by State (2020-2024)")
    ]

    for filename, description in datasets:
        filepath = OUTPUT_DIR / filename
        if filepath.exists():
            df = pd.read_csv(filepath)
            print(f"\n{description}")
            print(f"  File: {filename}")
            print(f"  Rows: {len(df):,}")
            print(f"  Columns: {len(df.columns)}")

            # Show key metrics
            if 'state' in df.columns:
                print(f"  States: {df['state'].nunique()}")
            if 'year' in df.columns:
                years = sorted(df['year'].unique())
                print(f"  Years: {years}")

    print()


def main():
    print("\n" + "="*80)
    print("CONSOLIDATING ALL EXTRACTED DATA")
    print("="*80 + "\n")

    # Consolidate tracer studies
    consolidate_tracer_state_data()
    consolidate_tracer_field_data()
    consolidate_tracer_level_data()

    # Generate summary
    create_summary_report()

    print("="*80)
    print("[SUCCESS] Data consolidation complete!")
    print("="*80 + "\n")

    print("FINAL DATASETS FOR ANALYSIS:")
    print("-"*80)
    print("  tracer_employment_by_state_2023_2024.csv   <- Use for map!")
    print("  tracer_employment_by_field_2023_2024.csv   <- Field outcomes")
    print("  tracer_employment_by_level_2023_2024.csv   <- Level outcomes")
    print("  graduates_by_state_2020_2024_clean.csv     <- Graduate supply")
    print("-"*80 + "\n")


if __name__ == "__main__":
    main()
