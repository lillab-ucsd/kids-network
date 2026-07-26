import pandas as pd

input_file = "_images-metadata_things.tsv"
output_file = "sorted-images.tsv"

words_to_keep = ["acorn", "cactus", "flower", "peanut", "tree", "grass", "leaf", "broccoli", "cabbage", "blueberry", "cherry", "apple", 
                 "butterfly", "ladybug", "squirrel", "peacock", "pigeon", "horse", "sheep", "lion", "wolf", "fox", "dolphin", "fish", 
                 "happy", "sad", "angry", "disgust", "surprise", "scared",
                 "airplane", "bike", "boat", "bus",  "car", "firetruck", "helicopter", "motorcycle", "sled", "stroller", "train", "truck",
                "bowl", "plate", "lamp", "pillow",  "scissors", "tape", "refrigerator", "chair", "couch", "bed", "camera", "clock", "vacuum",
                 "boot", "dress", "pants", "sweater", "sock", "shorts", "scarf", "coat", "hat", "necklace", "shoe", "shirt"]

df = pd.read_csv(input_file, sep="\t", dtype=str, keep_default_na=False)
df = df[df["Word"].isin(words_to_keep)].copy()

# Convert all four sort columns to numbers (non-numeric -> NaN)
df["_recog"] = pd.to_numeric(df["recognizability"], errors="coerce")
df["_name"] = pd.to_numeric(df["nameability"], errors="coerce")
df["_recog_n"] = pd.to_numeric(df["recognizability_N-ratings"], errors="coerce")
df["_name_n"] = pd.to_numeric(df["nameability_N-ratings"], errors="coerce")

# Within each Word, sort by the four metrics in priority order.
# Each one only breaks ties left unresolved by the ones before it.
df = df.sort_values(
    by=["Word", "_recog", "_name", "_recog_n", "_name_n"],
    ascending=[True, False, False, False, False],
    na_position="last",
)

df = df.drop(columns=["_recog", "_name", "_recog_n", "_name_n"])
df.to_csv(output_file, sep="\t", index=False)
print(f"Wrote {len(df)} rows.")