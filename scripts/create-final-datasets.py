"""
Create final analysis-ready datasets by combining all extracted data
"""

import pandas as pd
from pathlib import Path

INPUT_DIR = Path("data/PDF_EXTRACTS")
OUTPUT_DIR = INPUT_DIR


def create_master_state_dataset():
    """Create a master dataset combining graduates and employment data"""

    print("Creating master state-level dataset...")

    # Load graduates data (2020-2024)
    df_grads = pd.read_csv(INPUT_DIR / "graduates_by_state_2020_2024_clean.csv")

    # Load employment data (2023-2024)
    df_employ = pd.read_csv(INPUT_DIR / "tracer_employment_by_state_2023_2024.csv")

    # Rename graduates columns for clarity
    df_grads = df_grads.rename(columns={
        'Jumlah Total': 'total_graduates_produced',
        'Lelaki Male': 'male_graduates',
        'Perempuan Female': 'female_graduates'
    })

    # Merge on state + year
    df_master = pd.merge(
        df_grads,
        df_employ,
        on=['state', 'year'],
        how='outer'
    )

    # Sort
    df_master = df_master.sort_values(['state', 'year'])

    # Save
    output_path = OUTPUT_DIR / "master_state_education_employment.csv"
    df_master.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] {output_path}")
    print(f"     Rows: {len(df_master)}")
    print(f"     Combines: Graduate supply (2020-2024) + Employment outcomes (2023-2024)")
    print()

    return df_master


def create_latest_state_snapshot():
    """Create 2024 snapshot for easy map visualization"""

    print("Creating 2024 state snapshot...")

    df_master = pd.read_csv(INPUT_DIR / "master_state_education_employment.csv")

    # Filter to 2024
    df_2024 = df_master[df_master['year'] == 2024].copy()

    # Select key columns for mapping
    columns_for_map = [
        'state',
        'total_graduates_produced',
        'employed_count',
        'employed_pct',
        'unemployed_count',
        'unemployed_pct',
        'total_graduates'  # from tracer study (different from produced)
    ]

    df_2024_map = df_2024[columns_for_map]

    # Add derived metrics
    if 'total_graduates_produced' in df_2024_map.columns and 'employed_count' in df_2024_map.columns:
        # Employment absorption rate (employed / produced)
        df_2024_map['employment_absorption_rate'] = (
            df_2024_map['employed_count'] / df_2024_map['total_graduates_produced'] * 100
        ).round(2)

    output_path = OUTPUT_DIR / "state_snapshot_2024.csv"
    df_2024_map.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] {output_path}")
    print(f"     Rows: {len(df_2024_map)} states")
    print(f"     Use this for: Interactive map visualization")
    print()

    return df_2024_map


def create_field_analysis_dataset():
    """Create field-of-study analysis dataset with trends"""

    print("Creating field analysis dataset...")

    df_field = pd.read_csv(INPUT_DIR / "tracer_employment_by_field_2023_2024.csv")

    # Calculate year-over-year change
    df_field = df_field.sort_values(['field_of_study', 'year'])

    # Group by field and calculate changes
    field_summary = []

    for field in df_field['field_of_study'].unique():
        field_data = df_field[df_field['field_of_study'] == field]

        if len(field_data) == 2:  # Have both 2023 and 2024
            data_2023 = field_data[field_data['year'] == 2023].iloc[0]
            data_2024 = field_data[field_data['year'] == 2024].iloc[0]

            field_summary.append({
                'field_of_study': field,
                'employed_pct_2023': data_2023['employed_pct'],
                'employed_pct_2024': data_2024['employed_pct'],
                'employment_change': data_2024['employed_pct'] - data_2023['employed_pct'],
                'total_grads_2023': data_2023['total_graduates'],
                'total_grads_2024': data_2024['total_graduates'],
                'graduate_growth': data_2024['total_graduates'] - data_2023['total_graduates']
            })

    df_field_summary = pd.DataFrame(field_summary)
    df_field_summary = df_field_summary.sort_values('employed_pct_2024', ascending=False)

    output_path = OUTPUT_DIR / "field_analysis_summary.csv"
    df_field_summary.to_csv(output_path, index=False, encoding='utf-8-sig')

    print(f"[OK] {output_path}")
    print(f"     Rows: {len(df_field_summary)} fields")
    print(f"     Use this for: Field comparison charts, trend analysis")
    print()

    return df_field_summary


def create_metadata_file():
    """Create a metadata file describing all datasets"""

    metadata = {
        'Dataset': [],
        'Filename': [],
        'Rows': [],
        'Time_Period': [],
        'Granularity': [],
        'Key_Use': []
    }

    datasets = [
        {
            'Dataset': 'Master State Education-Employment',
            'Filename': 'master_state_education_employment.csv',
            'Time_Period': '2020-2024',
            'Granularity': 'State × Year',
            'Key_Use': 'Complete state-level analysis'
        },
        {
            'Dataset': '2024 State Snapshot',
            'Filename': 'state_snapshot_2024.csv',
            'Time_Period': '2024',
            'Granularity': 'State',
            'Key_Use': 'Interactive map visualization'
        },
        {
            'Dataset': 'Field Analysis Summary',
            'Filename': 'field_analysis_summary.csv',
            'Time_Period': '2023-2024',
            'Granularity': 'Field of Study',
            'Key_Use': 'Field comparison charts'
        },
        {
            'Dataset': 'Employment by State (Full)',
            'Filename': 'tracer_employment_by_state_2023_2024.csv',
            'Time_Period': '2023-2024',
            'Granularity': 'State × Year',
            'Key_Use': 'Employment outcome analysis'
        },
        {
            'Dataset': 'Employment by Field (Full)',
            'Filename': 'tracer_employment_by_field_2023_2024.csv',
            'Time_Period': '2023-2024',
            'Granularity': 'Field × Year',
            'Key_Use': 'Field-level employment analysis'
        },
        {
            'Dataset': 'Graduates by State',
            'Filename': 'graduates_by_state_2020_2024_clean.csv',
            'Time_Period': '2020-2024',
            'Granularity': 'State × Year',
            'Key_Use': 'Graduate supply trends'
        }
    ]

    for ds in datasets:
        filepath = OUTPUT_DIR / ds['Filename']
        if filepath.exists():
            df = pd.read_csv(filepath)
            metadata['Dataset'].append(ds['Dataset'])
            metadata['Filename'].append(ds['Filename'])
            metadata['Rows'].append(len(df))
            metadata['Time_Period'].append(ds['Time_Period'])
            metadata['Granularity'].append(ds['Granularity'])
            metadata['Key_Use'].append(ds['Key_Use'])

    df_meta = pd.DataFrame(metadata)

    output_path = OUTPUT_DIR / "DATASETS_METADATA.csv"
    df_meta.to_csv(output_path, index=False, encoding='utf-8-sig')

    print("\nDataset Metadata:")
    print("="*80)
    print(df_meta.to_string(index=False))
    print()

    return df_meta


def main():
    print(f"\n{'='*80}")
    print("CREATING FINAL ANALYSIS-READY DATASETS")
    print(f"{'='*80}\n")

    # Create derived datasets
    create_master_state_dataset()
    create_latest_state_snapshot()
    create_field_analysis_dataset()

    # Create metadata
    create_metadata_file()

    print(f"{'='*80}")
    print("[SUCCESS] Final datasets created!")
    print(f"{'='*80}\n")

    print("READY FOR DASHBOARD:")
    print("-"*80)
    print("  state_snapshot_2024.csv              <- Start here for map!")
    print("  master_state_education_employment.csv <- Full dataset")
    print("  field_analysis_summary.csv           <- Field comparisons")
    print("-"*80 + "\n")


if __name__ == "__main__":
    main()
