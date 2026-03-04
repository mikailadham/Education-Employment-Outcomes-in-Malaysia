"""
Clean extracted PDF data into proper CSV format
Processes raw PDF extracts and creates clean, analysis-ready CSVs
"""

import pandas as pd
from pathlib import Path
import re

INPUT_DIR = Path("data/PDF_EXTRACTS")
OUTPUT_DIR = INPUT_DIR  # Same directory, with _clean suffix


def clean_number(value):
    """Remove commas from numbers and convert to numeric"""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        # Remove commas and convert
        cleaned = value.replace(',', '').strip()
        try:
            return int(cleaned) if cleaned else None
        except ValueError:
            try:
                return float(cleaned)
            except ValueError:
                return value
    return value


def clean_percentage(value):
    """Convert percentage strings to floats"""
    if pd.isna(value):
        return None
    if isinstance(value, str):
        cleaned = value.replace(',', '').strip()
        try:
            return float(cleaned)
        except ValueError:
            return value
    return value


def clean_state_employment():
    """Clean employment by state data"""
    print("Cleaning state employment data...")

    df = pd.read_csv(INPUT_DIR / "tracer_employment_by_state_2024.csv")

    # Skip first 2 rows (malformed headers) and recreate
    df = pd.read_csv(INPUT_DIR / "tracer_employment_by_state_2024.csv", skiprows=2)

    # Rename columns properly
    df.columns = [
        'year',
        'state',
        'employed_count',
        'employed_pct',
        'unemployed_count',
        'unemployed_pct',
        'total_graduates',
        'total_pct'
    ]

    # Remove rows with missing state names (header rows, totals)
    df = df[df['state'].notna() & (df['state'] != '')]

    # Clean numeric columns
    for col in ['employed_count', 'unemployed_count', 'total_graduates']:
        df[col] = df[col].apply(clean_number)

    for col in ['employed_pct', 'unemployed_pct', 'total_pct']:
        df[col] = df[col].apply(clean_percentage)

    # Standardize state names (remove Malay translation)
    df['state'] = df['state'].str.split(' ').str[0:2].str.join(' ')  # Keep first 2 words
    df['state'] = df['state'].str.replace('Wilayah Persekutuan', 'WP')
    df['state'] = df['state'].str.strip()

    # Remove "Luar Negara" (outside Malaysia)
    df = df[df['state'] != 'Luar Negara']

    # Remove total row
    df = df[df['state'] != 'Jumlah Total']

    # Save cleaned version
    output_path = OUTPUT_DIR / "tracer_employment_by_state_2024_clean.csv"
    df.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] Saved: {output_path}")
    print(f"     States: {len(df)}")
    print(f"     Columns: {list(df.columns)}")
    print()

    return df


def clean_field_employment():
    """Clean employment by field of study data"""
    print("Cleaning field of study employment data...")

    df = pd.read_csv(INPUT_DIR / "tracer_employment_by_field_2024.csv", skiprows=2)

    # Rename columns
    df.columns = [
        'year',
        'field_of_study',
        'employed_count',
        'employed_pct',
        'unemployed_count',
        'unemployed_pct',
        'total_graduates',
        'total_pct'
    ]

    # Remove rows with missing fields
    df = df[df['field_of_study'].notna() & (df['field_of_study'] != '')]

    # Clean numeric columns
    for col in ['employed_count', 'unemployed_count', 'total_graduates']:
        df[col] = df[col].apply(clean_number)

    for col in ['employed_pct', 'unemployed_pct', 'total_pct']:
        df[col] = df[col].apply(clean_percentage)

    # Extract English field names (text after newline or comma)
    # Keep both languages for now
    df['field_of_study_en'] = df['field_of_study'].str.split('\n').str[-1]

    # Remove total row
    df = df[df['field_of_study'] != 'Jumlah Total']

    # Save
    output_path = OUTPUT_DIR / "tracer_employment_by_field_2024_clean.csv"
    df.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] Saved: {output_path}")
    print(f"     Fields: {len(df)}")
    print(f"     Columns: {list(df.columns)}")
    print()

    return df


def clean_level_employment():
    """Clean employment by level of study data"""
    print("Cleaning level of study employment data...")

    df = pd.read_csv(INPUT_DIR / "tracer_employment_by_level_2024.csv", skiprows=2)

    # Rename columns
    df.columns = [
        'year',
        'level_of_study',
        'employed_count',
        'employed_pct',
        'unemployed_count',
        'unemployed_pct',
        'total_graduates',
        'total_pct'
    ]

    # Remove rows with missing levels
    df = df[df['level_of_study'].notna() & (df['level_of_study'] != '')]

    # Clean numeric columns
    for col in ['employed_count', 'unemployed_count', 'total_graduates']:
        df[col] = df[col].apply(clean_number)

    for col in ['employed_pct', 'unemployed_pct', 'total_pct']:
        df[col] = df[col].apply(clean_percentage)

    # Remove total row
    df = df[df['level_of_study'] != 'Jumlah Total']

    # Save
    output_path = OUTPUT_DIR / "tracer_employment_by_level_2024_clean.csv"
    df.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] Saved: {output_path}")
    print(f"     Levels: {len(df)}")
    print(f"     Columns: {list(df.columns)}")
    print()

    return df


def main():
    print("\n" + "="*80)
    print("CLEANING PDF EXTRACTS")
    print("="*80 + "\n")

    # Clean each dataset
    state_df = clean_state_employment()
    field_df = clean_field_employment()
    level_df = clean_level_employment()

    print("="*80)
    print("[SUCCESS] All data cleaned!")
    print("="*80)

    # Show preview of state data (most important)
    print("\nState Employment Data Preview:")
    print("-"*80)
    print(state_df[['state', 'employed_pct', 'total_graduates']].head(10).to_string(index=False))
    print()


if __name__ == "__main__":
    main()
