#!/usr/bin/env python3
"""Redraw one child's arrangements exactly as they ended up on screen.

    python replay_placements.py p042
    python replay_placements.py p042 --images          # show the photographs
    python replay_placements.py --list                 # who is available

Reads the child's raw jsPsych CSV, parses the `placements` column, and draws
one panel per trial with the arena, the grid and every photograph where the
child left it. Items the pipeline flags as never placed are ringed in red.

Screen coordinates run downward, so the y axis is inverted to match what the
child saw.
"""

from __future__ import annotations

import argparse
import csv
import json
import math
import re
import sys
from pathlib import Path

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import Rectangle, Circle

# ---- arena geometry, from experiment.js ------------------------------------
# Both the three- and six-domain scripts use these same constants.
STAGE_W, STAGE_H = 1160, 760
GRID_COLS, GRID_ROWS, CELL = 10, 6, 104
GRID_W, GRID_H = GRID_COLS * CELL, GRID_ROWS * CELL
SMALL, FOCAL_SCALE, GAP = 90, 2, 40

_FOCAL_W = SMALL * FOCAL_SCALE
_LEFT_EDGE = (STAGE_W - (_FOCAL_W + GAP + GRID_W)) / 2        # -50
GRID_X = _LEFT_EDGE + _FOCAL_W + GAP                          # 170
GRID_Y = (STAGE_H - GRID_H) / 2 + 20                          # 88

X_MIN, X_MAX = GRID_X + SMALL / 2, GRID_X + GRID_W - SMALL / 2   # 215, 1165
Y_MIN, Y_MAX = GRID_Y + SMALL / 2, GRID_Y + GRID_H - SMALL / 2   # 133, 667

ENTRY_X = _LEFT_EDGE + _FOCAL_W / 2                           # 40
ENTRY_Y = GRID_Y + GRID_H / 2                                 # 400

BARELY_Y_TOL = 0.075 * (Y_MAX - Y_MIN)                        # ~40 px

DOMAIN_COLOURS = {
    "animals": "#0F728B", "plants": "#B8860B", "emotions": "#F1731D",
    "vehicle": "#5102A3", "clothing": "#B43359", "household_items": "#29A099",
}


def concept_of(image_name: str) -> str:
    """fox_1.jpg -> fox, camera1_2.jpg -> camera1, chocolate_2.jpg -> chocolate"""
    stem = re.sub(r"\.[A-Za-z0-9]+$", "", image_name)
    return re.sub(r"_\d+$", "", stem)


def find_file(data_dir: Path, pid: str) -> Path:
    """The CSV whose participant_id column matches, not whose name does."""
    exact = data_dir / f"{pid}.csv"
    if exact.exists():
        return exact
    for path in sorted(data_dir.glob("*.csv")):
        try:
            with open(path, newline="", encoding="utf8", errors="ignore") as fh:
                for row in csv.DictReader(fh):
                    if (row.get("participant_id") or "").strip() == pid:
                        return path
                    break          # the id is constant down a file
        except Exception:
            continue
    raise SystemExit(f"No file in {data_dir} has participant_id == {pid!r}. "
                     f"Try --list.")


def list_participants(data_dir: Path) -> None:
    found = []
    for path in sorted(data_dir.glob("*.csv")):
        try:
            with open(path, newline="", encoding="utf8", errors="ignore") as fh:
                for row in csv.DictReader(fh):
                    pid = (row.get("participant_id") or "").strip()
                    if pid:
                        found.append(pid)
                    break
        except Exception:
            continue
    print(f"{len(found)} participants in {data_dir}:")
    for i in range(0, len(found), 10):
        print("  " + "  ".join(found[i:i + 10]))


def read_trials(path: Path, include_practice: bool) -> list[dict]:
    """One entry per arrangement trial, with its items and release counts."""
    with open(path, newline="", encoding="utf8", errors="ignore") as fh:
        rows = list(csv.DictReader(fh))

    out = []
    for row in rows:
        if "grid" not in (row.get("trial_type") or ""):
            continue
        phase = (row.get("phase") or "").strip()
        raw = row.get("placements") or ""
        if raw in ("", "[]"):
            continue
        try:
            placements = json.loads(raw)
        except json.JSONDecodeError:
            continue

        try:
            trial = int(float(row.get("trial") or "nan"))
        except ValueError:
            continue
        if trial < 0 and not include_practice:
            continue

        drops: dict[str, int] = {}
        try:
            for mv in json.loads(row.get("move_log") or "[]"):
                key = mv.get("image") or mv.get("image_name")
                drops[key] = drops.get(key, 0) + 1
        except json.JSONDecodeError:
            pass

        items = []
        for p in placements:
            name = p.get("image_name") or p.get("image")
            x, y = float(p["posX"]), float(p["posY"])
            n_drops = drops.get(name)
            barely = (abs(x - X_MIN) < 0.51
                      and abs(y - ENTRY_Y) < BARELY_Y_TOL
                      and (n_drops is None or n_drops <= 1))
            items.append(dict(name=name, concept=concept_of(name),
                              x=x, y=y, n_drops=n_drops, barely=barely))

        out.append(dict(
            trial=trial, phase=phase or ("practice" if trial < 0 else "main"),
            block=row.get("block"),
            # Study 2 records the domain on the row; Study 1 does not.
            category=(row.get("category") or "").strip(),
            picture_set=(row.get("picture_set") or "").strip(),
            items=items, had_move_log=bool(drops)))
    return sorted(out, key=lambda t: t["trial"])


def index_stimuli(stim_dir: Path) -> dict[str, Path]:
    if not stim_dir or not stim_dir.exists():
        return {}
    return {p.name: p for p in stim_dir.rglob("*")
            if p.suffix.lower() in {".jpg", ".jpeg", ".png", ".gif"}}


def draw_trial(ax, trial: dict, stim: dict[str, Path], show_images: bool):
    colour = DOMAIN_COLOURS.get(trial["category"], "#444444")

    # arena, grid, clamp box
    ax.add_patch(Rectangle((0, 0), STAGE_W, STAGE_H,
                           facecolor="#f5f5f5", edgecolor="none", zorder=0))
    ax.add_patch(Rectangle((GRID_X, GRID_Y), GRID_W, GRID_H,
                           facecolor="white", edgecolor="#444444",
                           linewidth=1.6, zorder=1))
    for c in range(1, GRID_COLS):
        ax.plot([GRID_X + c * CELL] * 2, [GRID_Y, GRID_Y + GRID_H],
                color="#dddddd", lw=0.6, zorder=2)
    for r in range(1, GRID_ROWS):
        ax.plot([GRID_X, GRID_X + GRID_W], [GRID_Y + r * CELL] * 2,
                color="#dddddd", lw=0.6, zorder=2)
    ax.add_patch(Rectangle((X_MIN, Y_MIN), X_MAX - X_MIN, Y_MAX - Y_MIN,
                           facecolor="none", edgecolor="#bbbbbb",
                           linestyle=":", linewidth=1.0, zorder=3))
    ax.plot([ENTRY_X], [ENTRY_Y], marker="+", color="#999999",
            markersize=9, zorder=3)
    ax.annotate("entry", (ENTRY_X, ENTRY_Y - 26), ha="center",
                fontsize=6, color="#999999")

    for it in trial["items"]:
        drawn = False
        if show_images and it["name"] in stim:
            try:
                img = plt.imread(stim[it["name"]])
                ax.imshow(img, extent=(it["x"] - SMALL / 2, it["x"] + SMALL / 2,
                                       it["y"] + SMALL / 2, it["y"] - SMALL / 2),
                          zorder=4, aspect="auto")
                drawn = True
            except Exception:
                pass
        if not drawn:
            ax.add_patch(Circle((it["x"], it["y"]), 7, facecolor=colour,
                                edgecolor="white", linewidth=0.8, zorder=4))
        ax.annotate(it["concept"], (it["x"], it["y"] + (SMALL / 2 + 11
                                                        if drawn else 17)),
                    ha="center", fontsize=6.5, color="#222222", zorder=6)
        if it["barely"]:
            ax.add_patch(Circle((it["x"], it["y"]), SMALL / 2 + 4,
                                facecolor="none", edgecolor="#d32f2f",
                                linewidth=1.8, zorder=5))

    n_barely = sum(i["barely"] for i in trial["items"])
    bits = [f"trial {trial['trial']}"]
    if trial["category"]:
        bits.append(trial["category"])
    if trial["picture_set"]:
        bits.append(f"set {trial['picture_set']}")
    bits.append(f"{len(trial['items'])} items")
    if n_barely:
        bits.append(f"{n_barely} never placed")
    ax.set_title("  ·  ".join(bits), fontsize=9, color=colour, pad=6)

    # The grid runs to x = 1210 on an 1160-wide stage, because LEFT_EDGE is
    # -50, so the view has to cover the union of the two or the right-hand
    # column of cells is cut off.
    x_hi = max(STAGE_W, GRID_X + GRID_W) + 30
    ax.set_xlim(_LEFT_EDGE - 60, x_hi)
    ax.set_ylim(STAGE_H + 10, -10)        # inverted: screen y runs downward
    ax.set_aspect("equal")
    ax.set_xticks([]); ax.set_yticks([])
    for side in ax.spines.values():
        side.set_visible(False)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__,
                                 formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("participant", nargs="?", help="e.g. p042")
    ap.add_argument("--data", default="../data/data_v4",
                    help="folder of per-participant CSVs (default: %(default)s)")
    ap.add_argument("--stimuli", default="../experiment-scripts/stimuli",
                    help="stimulus folder, searched recursively")
    ap.add_argument("--images", action="store_true",
                    help="draw the photographs instead of dots")
    ap.add_argument("--practice", action="store_true",
                    help="include the practice trials")
    ap.add_argument("--out", default=None, help="output PNG (default: <pid>.png)")
    ap.add_argument("--list", action="store_true", dest="do_list")
    args = ap.parse_args()

    data_dir = Path(args.data).expanduser()
    if not data_dir.exists():
        raise SystemExit(f"No such folder: {data_dir.resolve()}")

    if args.do_list or not args.participant:
        list_participants(data_dir)
        return

    path = find_file(data_dir, args.participant)
    trials = read_trials(path, include_practice=args.practice)
    if not trials:
        raise SystemExit(f"No arrangement trials found in {path}")

    stim = index_stimuli(Path(args.stimuli).expanduser()) if args.images else {}
    if args.images and not stim:
        print(f"No images under {args.stimuli}; drawing dots instead.",
              file=sys.stderr)

    ncol = min(2, len(trials))
    nrow = math.ceil(len(trials) / ncol)
    fig, axes = plt.subplots(nrow, ncol, figsize=(7.6 * ncol, 4.8 * nrow))
    axes = [axes] if len(trials) == 1 else list(axes.ravel())

    for ax, trial in zip(axes, trials):
        draw_trial(ax, trial, stim, args.images)
    for ax in axes[len(trials):]:
        ax.set_visible(False)

    total_barely = sum(i["barely"] for t in trials for i in t["items"])
    note = "" if trials[0]["had_move_log"] else \
        "   (no move_log: the never-placed ring rests on position alone)"
    fig.suptitle(f"{args.participant}  ·  {path.name}  ·  "
                 f"{len(trials)} trials  ·  {total_barely} never placed{note}",
                 fontsize=11, y=0.995)
    fig.tight_layout(rect=(0, 0, 1, 0.98))

    out = Path(args.out) if args.out else Path(f"{args.participant}.png")
    fig.savefig(out, dpi=150)
    print(f"wrote {out.resolve()}")

    for t in trials:
        flagged = [i["concept"] for i in t["items"] if i["barely"]]
        print(f"  trial {t['trial']:>3}  {t['category'] or '?':<16} "
              f"{len(t['items']):>2} items" +
              (f"   never placed: {', '.join(flagged)}" if flagged else ""))


if __name__ == "__main__":
    main()
