"""
placements_free.py
──────────────────
Recreates the sorting canvas for selected participants and saves one PNG
per trial.

Set PARTICIPANTS at the top to the IDs you want (e.g. the children who failed
the comprehension check). Leave it empty to plot everyone.

Output:  ../plots/placement_plots/{participant_id}/{category}_trial{N}.png
"""

import json
import os
import re
import glob
import pandas as pd
import matplotlib.pyplot as plt
import matplotlib.patches as patches
from matplotlib.offsetbox import OffsetImage, AnnotationBbox
from PIL import Image
import numpy as np

# ── WHAT TO PLOT ──────────────────────────────────────────────────────────────

# Participant IDs to plot. Empty list = everyone.
# Matching is case-insensitive and ignores leading zeros, so "p012", "P12"
# and "p12" all match the same person. Works for any ID scheme:
#     "p001", "adult_1", "6a17230d60e2a318a8073ab6", 12
# A bare number ("12") matches any ID whose numeric part is 12 — handy, but
# it can match more than one scheme at once, so the script reports what it hit.
PARTICIPANTS = [
    "test_mtl65jkx",
    "test_qic2uph8",
    "test_1ls6dw3j",
    "test_iqzl768m",
    "test_m80krjwa"
]

INCLUDE_MAIN     = True    # phase == "main"   (trial > 0)
INCLUDE_PRACTICE = True    # phase == "practice" (trial -1 and -2)

DRAW_GRID_LINES  = True    # free sort isn't snapped; lines are a visual reference

# ── PATHS ─────────────────────────────────────────────────────────────────────

DATA_DIR    = "../data/free_sort"
STIMULI_DIR = "stimuli"
OUTPUT_DIR  = "../plots/placement_plots"

DPI = 120

# ── Experiment constants (must match experiment.js) ───────────────────────────

GRID_COLS  = 10
GRID_ROWS  = 6
CELL_SIZE  = 104

GRID_W = GRID_COLS * CELL_SIZE   # 1040
GRID_H = GRID_ROWS * CELL_SIZE   # 624

BASE_W      = 1160
BASE_H      = 760
SMALL_SIZE  = 90
FOCAL_SCALE = 2
GAP         = 40

focal_w   = SMALL_SIZE * FOCAL_SCALE
total_w   = focal_w + GAP + GRID_W
LEFT_EDGE = (BASE_W - total_w) / 2
GRID_X    = LEFT_EDGE + focal_w + GAP
GRID_Y    = (BASE_H - GRID_H) / 2 + 20

# ── Helpers ───────────────────────────────────────────────────────────────────

def norm_id(x):
    """Normalise an ID for comparison, without destroying its scheme.

    Lowercases, treats -/space/. as _, and strips leading zeros inside each
    run of digits:
        "P012"   -> "p12"
        "adult_01" -> "adult_1"
        "6a17230d..." -> "6a17230d..."   (unchanged)

    Crucially "adult_1" and "p001" normalise differently, so they never
    collide the way a digits-only match would.
    """
    s = str(x).strip().lower()
    s = re.sub(r"[\s\-.]+", "_", s)
    s = re.sub(r"\d+", lambda m: str(int(m.group(0))), s)
    return s


def numeric_part(x):
    """Trailing number in an ID, or None. 'adult_12' -> 12, 'p007' -> 7."""
    m = re.search(r"(\d+)\s*$", str(x))
    return int(m.group(1)) if m else None


WANTED_EXACT = {norm_id(p) for p in PARTICIPANTS}
# Entries typed as a bare number, e.g. 12 or "12"
WANTED_NUMS = {int(p) for p in PARTICIPANTS if str(p).strip().isdigit()}


def is_wanted(pid):
    """True if this participant was requested (or if nothing was requested)."""
    if not PARTICIPANTS:
        return True
    if norm_id(pid) in WANTED_EXACT:
        return True
    n = numeric_part(pid)
    return n is not None and n in WANTED_NUMS


def build_image_index(stimuli_dir):
    """filename -> (full path, category folder name). Built once, not per image."""
    index = {}
    for root, _, files in os.walk(stimuli_dir):
        category = os.path.basename(root)
        for f in files:
            if f.lower().endswith((".jpg", ".jpeg", ".png")):
                index.setdefault(f, (os.path.join(root, f), category))
    return index


def load_img_array(path, size):
    img = Image.open(path).convert("RGBA").resize((size, size), Image.LANCZOS)
    return np.array(img)


def parse_placements(csv_path, image_index):
    """Return trial dicts for the requested phases, for this participant."""
    df = pd.read_csv(csv_path)

    if "placements" not in df.columns:
        return []

    wanted_phases = []
    if INCLUDE_MAIN:
        wanted_phases.append("main")
    if INCLUDE_PRACTICE:
        wanted_phases.append("practice")

    mask = (
        (df["trial_type"] == "emotion-grid")
        & (df["phase"].isin(wanted_phases))
        & df["placements"].notna()
    )

    trials = []
    for _, row in df[mask].iterrows():

        pid = (row.get("participant_id") or row.get("participant")
               or os.path.splitext(os.path.basename(csv_path))[0])

        # Skip participants we didn't ask for
        if not is_wanted(pid):
            continue

        try:
            placements = json.loads(row["placements"])
        except (TypeError, ValueError):
            continue
        if not placements:
            continue

        trial_num = int(float(row["trial"]))
        phase     = row["phase"]

        # Practice trials have a null block; main trials have a number.
        block = row.get("block")
        try:
            block = int(float(block))
        except (TypeError, ValueError):
            block = None

        # Category comes from the stimulus folder, NOT from the block number:
        # block order is randomised per participant, so block 1 is not always
        # the same category.
        first_name = placements[0].get("image_name", "")
        category = image_index.get(first_name, (None, None))[1] or "unknown"

        if phase == "practice":
            label = f"practice{abs(trial_num)}"
            title = f"{pid} | practice {abs(trial_num)}"
        else:
            label = category
            title = f"{pid} | {category} | trial {trial_num}"

        trials.append({
            "participant": pid,
            "phase":    phase,
            "block":    block,
            "trial":    trial_num,
            "category": label,
            "title":    title,
            "images": [
                {"name": p["image_name"],
                 "posX": float(p["posX"]),
                 "posY": float(p["posY"])}
                for p in placements
            ],
        })

    return sorted(trials, key=lambda t: (t["phase"] != "practice", t["trial"]))


# ── Plot ──────────────────────────────────────────────────────────────────────

def plot_trial(trial, image_index, output_dir, dpi=DPI):

    fig_w, fig_h = GRID_W / dpi, GRID_H / dpi
    fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=dpi)
    fig.subplots_adjust(left=0, right=1, top=1, bottom=0)

    ax.set_xlim(0, GRID_W)
    ax.set_ylim(GRID_H, 0)          # inverted: row 0 at the top
    ax.set_aspect("equal")
    ax.axis("off")
    fig.patch.set_facecolor("white")
    ax.set_facecolor("white")

    ax.add_patch(patches.Rectangle(
        (0, 0), GRID_W, GRID_H,
        linewidth=1.5, edgecolor="#333", facecolor="white", zorder=1))

    if DRAW_GRID_LINES:
        for c in range(1, GRID_COLS):
            ax.plot([c * CELL_SIZE] * 2, [0, GRID_H],
                    color="#cfcfcf", linewidth=0.8, zorder=2)
        for r in range(1, GRID_ROWS):
            ax.plot([0, GRID_W], [r * CELL_SIZE] * 2,
                    color="#cfcfcf", linewidth=0.8, zorder=2)

    img_display_size = CELL_SIZE - 4
    missing = []

    for info in trial["images"]:
        local_x = info["posX"] - GRID_X
        local_y = info["posY"] - GRID_Y

        entry = image_index.get(info["name"])
        if entry is None:
            missing.append(info["name"])
            ax.add_patch(plt.Circle((local_x, local_y),
                                    radius=img_display_size / 2 - 4,
                                    color="#a68be0", alpha=0.7, zorder=5))
            label = os.path.splitext(info["name"])[0].replace("_", "\n")
            ax.text(local_x, local_y, label, ha="center", va="center",
                    fontsize=8, color="#4f1db3", zorder=6)
        else:
            arr = load_img_array(entry[0], size=img_display_size)
            box = OffsetImage(arr, zoom=1.0)
            box.image.axes = ax
            ax.add_artist(AnnotationBbox(box, (local_x, local_y),
                                         frameon=False, zorder=5))

    ax.set_title(trial["title"], fontsize=10, pad=8,
                 color="#222", fontfamily="monospace")

    if missing:
        print(f"    [!] images not found: {missing}")

    pid_safe = str(trial["participant"]).replace("/", "_").replace("\\", "_")
    out_folder = os.path.join(output_dir, pid_safe)
    os.makedirs(out_folder, exist_ok=True)
    out = os.path.join(out_folder, f"{trial['category']}_trial{trial['trial']}.png")
    fig.savefig(out, dpi=dpi, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"    saved: {out}")


# ── Entry point ───────────────────────────────────────────────────────────────

def main():
    csv_files = sorted(glob.glob(os.path.join(DATA_DIR, "*.csv")))
    if not csv_files:
        print(f"No CSV files found in '{DATA_DIR}'")
        return

    image_index = build_image_index(STIMULI_DIR)
    print(f"Indexed {len(image_index)} stimulus images from '{STIMULI_DIR}'")

    if PARTICIPANTS:
        print(f"Plotting only: {', '.join(str(p) for p in PARTICIPANTS)}")
    else:
        print("Plotting ALL participants")
    print(f"Phases: main={INCLUDE_MAIN}  practice={INCLUDE_PRACTICE}\n")

    n_plotted = 0
    matched_ids = set()      # normalised IDs actually found

    for csv_path in csv_files:
        trials = parse_placements(csv_path, image_index)
        if not trials:
            continue

        pid = trials[0]["participant"]
        matched_ids.add(norm_id(pid))
        print(f"── {os.path.basename(csv_path)}  ({len(trials)} trial(s), {pid})")

        for trial in trials:
            plot_trial(trial, image_index, OUTPUT_DIR)
            n_plotted += 1
        print()

    # Warn about requested IDs that never turned up
    if PARTICIPANTS:
        not_found = []
        for p in PARTICIPANTS:
            if norm_id(p) in matched_ids:
                continue
            n = numeric_part(p) if str(p).strip().isdigit() else None
            if n is not None and any(numeric_part(m) == n for m in matched_ids):
                continue
            not_found.append(str(p))
        if not_found:
            print(f"[!] requested but not found in data: {', '.join(sorted(not_found))}")
        if matched_ids:
            print(f"    matched: {', '.join(sorted(matched_ids))}")

    print(f"Done. {n_plotted} PNG(s) saved to '{OUTPUT_DIR}/'")


if __name__ == "__main__":
    main()