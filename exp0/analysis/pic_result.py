import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.image as mpimg
import os

# ---------------- SETTINGS ----------------
GRID_COLS = 10
GRID_ROWS = 10
CELL_SIZE = 1
OUTPUT_DIR = "reconstructed_layouts"
STIM_ROOT = "stimuli"
# ------------------------------------------

os.makedirs(OUTPUT_DIR, exist_ok=True)

# Load your exported final placements
df = pd.read_csv("final_placements.csv")

# Ensure numeric
df["posX"] = pd.to_numeric(df["posX"])
df["posY"] = pd.to_numeric(df["posY"])

# Group by participant × trial
grouped = df.groupby(["participant_id", "category", "trial"])

for (pid, category, trial), data in grouped:

    fig, ax = plt.subplots(figsize=(6, 6))

    # Draw grid
    for i in range(GRID_ROWS + 1):
        ax.axhline(i, linewidth=0.5)
    for j in range(GRID_COLS + 1):
        ax.axvline(j, linewidth=0.5)

    # Place images
    for _, row in data.iterrows():

        col = row["posX"]
        row_pos = row["posY"]
        image_name = row["image_name"]

        # Build correct file path
        image_path = os.path.join(STIM_ROOT, category, image_name)

        if not os.path.exists(image_path):
            print(f"Missing image: {image_path}")
            continue

        img = mpimg.imread(image_path)

        # Grid cells start at 1, so shift to 0-based
        x0 = col - 1
        y0 = GRID_ROWS - row_pos

        ax.imshow(
            img,
            extent=(x0, x0 + 1, y0, y0 + 1)
        )

    ax.set_xlim(0, GRID_COLS)
    ax.set_ylim(0, GRID_ROWS)
    ax.set_xticks([])
    ax.set_yticks([])
    ax.set_title(f"{pid} | {category} | Trial {trial}")

    filename = f"{pid}_{category}_trial{trial}.png"
    plt.savefig(os.path.join(OUTPUT_DIR, filename), dpi=300)
    plt.close()

print("All layouts successfully reconstructed.")