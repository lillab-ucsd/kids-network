"""
reconstruct_placements.py
─────────────────────────
Recreates the experiment grid for every main-phase trial using the
actual stimulus images, then saves one PNG per trial.

Usage
-----
    python reconstruct_placements.py

Edit the three paths at the top of CONFIG to match your setup.
"""

import json
import os
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from PIL import Image
import numpy as np

# ── CONFIG ────────────────────────────────────────────────────────────────────

CSV_PATH     = "testj.csv"
STIMULI_DIR  = "stimuli"
OUTPUT_DIR   = "placement_plots"

IMAGE_SIZE   = 90
DPI          = 120

# ── Experiment constants (must match experiment.js exactly) ───────────────────

BASE_W      = 1160
BASE_H      = 760
GRID_COLS   = 10
GRID_ROWS   = 6
CELL_SIZE   = 104
SMALL_SIZE  = 90
FOCAL_SCALE = 2
GAP         = 40

GRID_W      = GRID_COLS * CELL_SIZE       # 1040
GRID_H      = GRID_ROWS * CELL_SIZE       # 624
focal_w     = SMALL_SIZE * FOCAL_SCALE    # 180
total_w     = focal_w + GAP + GRID_W      # 1260
LEFT_EDGE   = (BASE_W - total_w) / 2      # -50
GRID_X      = LEFT_EDGE + focal_w + GAP   # 170
GRID_Y      = (BASE_H - GRID_H) / 2 + 20  # 88

# ── Helpers ───────────────────────────────────────────────────────────────────

def find_image(filename, stimuli_dir):
    """Walk stimuli_dir recursively to find a file by name."""
    for root, _, files in os.walk(stimuli_dir):
        if filename in files:
            return os.path.join(root, filename)
    return None


def load_img_array(path, size=IMAGE_SIZE):
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
        trials.append({
            "participant": row.get("participant_id", row.get("participant", "?")),
            "block":  int(row["block"]),
            "trial":  int(row["trial"]),
            "label":  f"Block {int(row['block'])}  Trial {int(row['trial'])}",
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
    fig_w = BASE_W / dpi
    fig_h = BASE_H / dpi
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)

    # Axes span the full stage coordinate space.
    # y-axis is inverted so (0,0) is top-left, matching the browser.
    ax.set_xlim(0, BASE_W)
    ax.set_ylim(BASE_H, 0)          # inverted
    ax.set_aspect("equal")
    ax.axis("off")
    fig.patch.set_facecolor("#e8e8e8")
    ax.set_facecolor("#e8e8e8")

    # ── Focal area ────────────────────────────────────────────────────────────
    focal_rect = patches.Rectangle(
        (LEFT_EDGE, GRID_Y), focal_w, GRID_H,
        linewidth=1, edgecolor="#999", facecolor="#d4d4d4"
    )
    ax.add_patch(focal_rect)
    ax.text(
        LEFT_EDGE + focal_w / 2, GRID_Y + GRID_H / 2,
        "focal\narea",
        ha="center", va="center",
        fontsize=7, color="#888"
    )

    # ── Grid background ───────────────────────────────────────────────────────
    grid_rect = patches.Rectangle(
        (GRID_X, GRID_Y), GRID_W, GRID_H,
        linewidth=2, edgecolor="#444", facecolor="white", zorder=1
    )
    ax.add_patch(grid_rect)

    # Grid lines
    for c in range(1, GRID_COLS):
        x = GRID_X + c * CELL_SIZE
        ax.plot([x, x], [GRID_Y, GRID_Y + GRID_H],
                color="#ccc", linewidth=0.5, zorder=2)
    for r in range(1, GRID_ROWS):
        y = GRID_Y + r * CELL_SIZE
        ax.plot([GRID_X, GRID_X + GRID_W], [y, y],
                color="#ccc", linewidth=0.5, zorder=2)

    # ── Place images ──────────────────────────────────────────────────────────
    missing = []
    for img_info in trial["images"]:
        path = find_image(img_info["name"], stimuli_dir)
        if path is None:
            missing.append(img_info["name"])
            # Draw a placeholder circle
            circle = plt.Circle(
                (img_info["posX"], img_info["posY"]),
                radius=IMAGE_SIZE / 2,
                color="#f08080", alpha=0.6, zorder=5
            )
            ax.add_patch(circle)
            ax.text(
                img_info["posX"], img_info["posY"],
                img_info["name"].replace(".jpg", ""),
                ha="center", va="center", fontsize=5, color="#600", zorder=6
            )
            continue

        arr = load_img_array(path, size=IMAGE_SIZE)
        imagebox = OffsetImage(arr, zoom=1.0)
        imagebox.image.axes = ax

        ab = AnnotationBbox(
            imagebox,
            (img_info["posX"], img_info["posY"]),
            frameon=False,
            zorder=5,
        )
        ax.add_artist(ab)

    # ── Title ─────────────────────────────────────────────────────────────────
    ax.set_title(
        f"{trial['participant']}  ·  {trial['label']}",
        fontsize=11, pad=6, color="#333"
    )

    if missing:
        print(f"  [!] {trial['label']}: images not found: {missing}")

    # ── Save ──────────────────────────────────────────────────────────────────
    os.makedirs(output_dir, exist_ok=True)
    pid   = str(trial["participant"]).replace("/", "_")
    fname = f"{pid}_block{trial['block']}_trial{trial['trial']}.png"
    out   = os.path.join(output_dir, fname)
    fig.savefig(out, dpi=dpi, bbox_inches="tight")
    plt.close(fig)
    print(f"  Saved: {out}")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    print(f"Reading: {CSV_PATH}")
    trials = parse_placements(CSV_PATH)
    print(f"Found {len(trials)} main-phase trial(s)\n")

    for trial in trials:
        print(f"Plotting {trial['label']} …")
        plot_trial(trial, STIMULI_DIR, OUTPUT_DIR)

    print(f"\nDone. PNGs saved to '{OUTPUT_DIR}/'")


if __name__ == "__main__":
    main()
