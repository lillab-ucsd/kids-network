import pandas as pd

# Input/output paths
input_file = "input.tsv"
output_file = "filtered.tsv"

# The words you want to keep (edit this list)
words_to_keep = ["apple", "banana", "cherry"]

# Read the TSV
df = pd.read_csv(input_file, sep="\t", dtype=str, keep_default_na=False)

# Keep only rows where the Word column matches one of your words
filtered = df[df["Word"].isin(words_to_keep)]

# Write back out as TSV
filtered.to_csv(output_file, sep="\t", index=False)

print(f"Kept {len(filtered)} of {len(df)} rows.")