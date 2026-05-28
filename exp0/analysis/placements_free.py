"""
reconstruct_placements.py
─────────────────────────
Recreates the experiment grid for every main-phase trial using the
actual stimulus images, then saves one PNG per trial per participant.

Usage
-----
Output is organized as:  placement_plots/{participant_id}/block{N}_trial{N}.png
"""

import json
import os
import glob
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from PIL import Image
import numpy as np

# ── CONFIG ────────────────────────────────────────────────────────────────────

DATA_DIR    = "../data/free_sort"   # folder containing all participant CSVs
STIMULI_DIR = "stimuli"             # root folder that contains animals/, plants/, etc.
OUTPUT_DIR  = "../plots/placement_plots"     # folder where PNGs will be saved

IMAGE_SIZE  = 90
DPI         = 120
 
# ── Experiment constants ───────────────────
 
GRID_COLS  = 10
GRID_ROWS  = 6
CELL_SIZE  = 104
 
# Derived
GRID_W = GRID_COLS * CELL_SIZE   # 1040
GRID_H = GRID_ROWS * CELL_SIZE   # 624
 
BASE_W     = 1160
BASE_H     = 760
SMALL_SIZE = 90
FOCAL_SCALE = 2
GAP        = 40
 
focal_w    = SMALL_SIZE * FOCAL_SCALE
total_w    = focal_w + GAP + GRID_W
LEFT_EDGE  = (BASE_W - total_w) / 2
GRID_X     = LEFT_EDGE + focal_w + GAP
GRID_Y     = (BASE_H - GRID_H) / 2 + 20
 
# Block number → category label
BLOCK_LABELS = {1: "animals", 2: "emotions", 3: "plants"}
 
# ── Helpers ───────────────────────────────────────────────────────────────────
 
def find_image(filename, stimuli_dir):
    """Walk stimuli_dir recursively to find a file by name."""
    for root, _, files in os.walk(stimuli_dir):
        if filename in files:
            return os.path.join(root, filename)
    return None
 
 
def load_img_array(path, size):
    """Load an image as an RGBA numpy array, resized to size×size."""
    img = Image.open(path).convert("RGBA").resize((size, size), Image.LANCZOS)
    return np.array(img)
 
 
 
def parse_placements(csv_path):
    """Return a list of trial dicts with only main-phase emotion-grid rows."""
    df = pd.read_csv(csv_path)
    mask = (
        (df["trial_type"] == "emotion-grid") &
        (df["phase"] == "main") &
        df["placements"].notna()
    )
    trials = []
    for _, row in df[mask].iterrows():
        placements = json.loads(row["placements"])
        pid = (row.get("participant_id") or row.get("participant") or
               os.path.splitext(os.path.basename(csv_path))[0])
        block = int(row["block"])
        trial_num = int(row["trial"])
        category = BLOCK_LABELS.get(block, f"block{block}")
        trials.append({
            "participant": pid,
            "block":    block,
            "trial":    trial_num,
            "category": category,
            "title":    f"{pid} | {category} | Trial {trial_num}",
            "images": [
                {
                    "name": p["image_name"],
                    "posX": float(p["posX"]),
                    "posY": float(p["posY"]),
                }
                for p in placements
            ],
        })
    return sorted(trials, key=lambda t: t["trial"])
 
 
# ── Main plot function ────────────────────────────────────────────────────────
 
def plot_trial(trial, stimuli_dir, output_dir, dpi=DPI):
    # Figure sized to exactly the grid (no surrounding canvas)
    fig_w = GRID_W / dpi
    fig_h = GRID_H / dpi
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)
    fig.subplots_adjust(left=0, right=1, top=1, bottom=0)
 
    # Axes in grid-local coordinates: (0,0) top-left, (GRID_W, GRID_H) bottom-right
    ax.set_xlim(0, GRID_W)
    ax.set_ylim(GRID_H, 0)   # inverted y so row 0 is at the top
    ax.set_aspect("equal")
    ax.axis("off")
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")
 
    # Grid border
    ax.add_patch(patches.Rectangle(
        (0, 0), GRID_W, GRID_H,
        linewidth=1.5, edgecolor="#333", facecolor="white", zorder=1
    ))
 
    # Grid lines — blue, like the reference image
    for c in range(1, GRID_COLS):
        x = c * CELL_SIZE
        ax.plot([x, x], [0, GRID_H], color="#6baed6", linewidth=0.8, zorder=2)
    for r in range(1, GRID_ROWS):
        y = r * CELL_SIZE
        ax.plot([0, GRID_W], [y, y], color="#6baed6", linewidth=0.8, zorder=2)
 
    # Place images — snapped to cell centers
    img_display_size = CELL_SIZE - 4   # slight padding inside each cell
    missing = []
 
    for img_info in trial["images"]:
        # Use exact placement coordinates, converted to grid-local space
        local_x = img_info["posX"] - GRID_X
        local_y = img_info["posY"] - GRID_Y
 
        path = find_image(img_info["name"], stimuli_dir)
        if path is None:
            missing.append(img_info["name"])
            # Red circle placeholder
            ax.add_patch(plt.Circle(
                (local_x, local_y),
                radius=img_display_size / 2 - 4,
                color="#a68be0", alpha=0.7, zorder=5
            ))
            label = img_info["name"].replace(".jpg", "").replace("_", "\n")
            ax.text(local_x, local_y, label,
                    ha="center", va="center", fontsize=8, color="#4f1db3", zorder=6)
        else:
            arr = load_img_array(path, size=img_display_size)
            imagebox = OffsetImage(arr, zoom=1.0)
            imagebox.image.axes = ax
            ax.add_artist(AnnotationBbox(
                imagebox, (local_x, local_y),
                frameon=False, zorder=5
            ))
 
    # Title above the grid
    ax.set_title(trial["title"], fontsize=10, pad=8, color="#222",
                 fontfamily="monospace")
 
    if missing:
        print(f"    [!] images not found: {missing}")
 
    # Save — one subfolder per participant
    pid_safe = str(trial["participant"]).replace("/", "_").replace("\\", "_")
    out_folder = os.path.join(output_dir, pid_safe)
    os.makedirs(out_folder, exist_ok=True)
    fname = f"{trial['category']}_trial{trial['trial']}.png"
    out   = os.path.join(out_folder, fname)
    fig.savefig(out, dpi=dpi, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"    Saved: {out}")
 
 
# ── Entry point ───────────────────────────────────────────────────────────────
 
def main():
    csv_files = sorted(glob.glob(os.path.join(DATA_DIR, "*.csv")))
    if not csv_files:
        print(f"No CSV files found in '{DATA_DIR}'")
        return
 
    print(f"Found {len(csv_files)} CSV file(s) in '{DATA_DIR}'\n")
 
    for csv_path in csv_files:
        print(f"── {os.path.basename(csv_path)}")
        trials = parse_placements(csv_path)
 
        if not trials:
            print("   No main-phase trials found, skipping.\n")
            continue
 
        print(f"   {len(trials)} trial(s) for participant: {trials[0]['participant']}")
        for trial in trials:
            print(f"  Plotting {trial['title']} …")
            plot_trial(trial, STIMULI_DIR, OUTPUT_DIR)
        print()
 
    print(f"Done. PNGs saved to '{OUTPUT_DIR}/'")
 
 
if __name__ == "__main__":
    main()