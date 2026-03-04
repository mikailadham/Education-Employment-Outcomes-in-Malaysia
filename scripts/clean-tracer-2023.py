"""
Clean Tracer Study 2023 data
"""

import pandas as pd
from pathlib import Path
import re

INPUT_DIR = Path("data/PDF_EXTRACTS")
OUTPUT_DIR = INPUT_DIR


def clean_number(value):
    if pd.isna(value):
        return None
    if isinstance(value, str):
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
    print("Cleaning 2023 state employment data...")

    df = pd.read_csv(INPUT_DIR / "tracer_employment_by_state_2023.csv", skiprows=2)

    # 2023 has more categories: Employed, Further Study, Upgrading Skills, Waiting, Not Working Yet
    df.columns = [
        'year', 'state',
        'employed_count', 'employed_pct',
        'further_study_count', 'further_study_pct',
        'upgrading_skills_count', 'upgrading_skills_pct',
        'waiting_placement_count', 'waiting_placement_pct',
        'unemployed_count', 'unemployed_pct',
        'total_graduates', 'total_pct'
    ]

    df = df[df['state'].notna() & (df['state'] != '')]

    # Clean all count columns
    for col in ['employed_count', 'further_study_count', 'upgrading_skills_count',
                'waiting_placement_count', 'unemployed_count', 'total_graduates']:
        df[col] = df[col].apply(clean_number)

    # Clean all percentage columns
    for col in ['employed_pct', 'further_study_pct', 'upgrading_skills_pct',
                'waiting_placement_pct', 'unemployed_pct', 'total_pct']:
        df[col] = df[col].apply(clean_percentage)

    df['state'] = df['state'].str.split(' ').str[0:2].str.join(' ')
    df['state'] = df['state'].str.replace('Wilayah Persekutuan', 'WP')
    df['state'] = df['state'].str.strip()

    df = df[df['state'] != 'Luar Negara']
    df = df[df['state'] != 'Jumlah Total']

    output_path = OUTPUT_DIR / "tracer_employment_by_state_2023_clean.csv"
    df.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] Saved: {output_path}")
    print(f"     States: {len(df)}")
    return df


def clean_field_employment():
    print("Cleaning 2023 field employment data...")

    df = pd.read_csv(INPUT_DIR / "tracer_employment_by_field_2023.csv", skiprows=2)

    df.columns = [
        'year', 'field_of_study',
        'employed_count', 'employed_pct',
        'further_study_count', 'further_study_pct',
        'upgrading_skills_count', 'upgrading_skills_pct',
        'waiting_placement_count', 'waiting_placement_pct',
        'unemployed_count', 'unemployed_pct',
        'total_graduates', 'total_pct'
    ]

    df = df[df['field_of_study'].notna() & (df['field_of_study'] != '')]

    for col in ['employed_count', 'further_study_count', 'upgrading_skills_count',
                'waiting_placement_count', 'unemployed_count', 'total_graduates']:
        df[col] = df[col].apply(clean_number)

    for col in ['employed_pct', 'further_study_pct', 'upgrading_skills_pct',
                'waiting_placement_pct', 'unemployed_pct', 'total_pct']:
        df[col] = df[col].apply(clean_percentage)

    df['field_of_study_en'] = df['field_of_study'].str.split('\n').str[-1]
    df = df[df['field_of_study'] != 'Jumlah Total']

    output_path = OUTPUT_DIR / "tracer_employment_by_field_2023_clean.csv"
    df.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] Saved: {output_path}")
    print(f"     Fields: {len(df)}")
    return df


def clean_level_employment():
    print("Cleaning 2023 level employment data...")

    df = pd.read_csv(INPUT_DIR / "tracer_employment_by_level_2023.csv", skiprows=2)

    df.columns = [
        'year', 'level_of_study',
        'employed_count', 'employed_pct',
        'further_study_count', 'further_study_pct',
        'upgrading_skills_count', 'upgrading_skills_pct',
        'waiting_placement_count', 'waiting_placement_pct',
        'unemployed_count', 'unemployed_pct',
        'total_graduates', 'total_pct'
    ]

    df = df[df['level_of_study'].notna() & (df['level_of_study'] != '')]

    for col in ['employed_count', 'further_study_count', 'upgrading_skills_count',
                'waiting_placement_count', 'unemployed_count', 'total_graduates']:
        df[col] = df[col].apply(clean_number)

    for col in ['employed_pct', 'further_study_pct', 'upgrading_skills_pct',
                'waiting_placement_pct', 'unemployed_pct', 'total_pct']:
        df[col] = df[col].apply(clean_percentage)

    df = df[df['level_of_study'] != 'Jumlah Total']

    output_path = OUTPUT_DIR / "tracer_employment_by_level_2023_clean.csv"
    df.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] Saved: {output_path}")
    print(f"     Levels: {len(df)}")
    return df


def main():
    print(f"\n{'='*80}")
    print("CLEANING TRACER STUDY 2023")
    print(f"{'='*80}\n")

    clean_state_employment()
    clean_field_employment()
    clean_level_employment()

    print(f"\n{'='*80}")
    print("[SUCCESS] All 2023 data cleaned!")
    print(f"{'='*80}\n")


if __name__ == "__main__":
    main()
