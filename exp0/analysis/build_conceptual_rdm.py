#!/usr/bin/env python3
"""
build_conceptual_rdm.py
=======================
Build the SPoSE (conceptual) reference RDM from the THINGS behavioural data.

Writes conceptual_rdm_long.csv, which 01_build_model_rdms.py then reads via
its PREBUILT_CONCEPTUAL setting.

NEEDS
-----
  spose_embedding_66d_sorted.txt   1854 x 66, tab-separated   (OSF f5rn6)
  unique_id.txt                    1854 concept names, one per line,
                                   IN THE SAME ROW ORDER as the embedding
  concept_inventory.csv            category, base_name, set, image_name

No network, no torch. Only numpy, pandas, scipy.

    python3 build_conceptual_rdm.py

WHY THIS IS A SEPARATE SCRIPT
-----------------------------
The conceptual RDM depends only on the concept names, never on the images, so
it never needs rebuilding when stimuli change -- unlike the DINOv2 and CLIP
RDMs. Keeping it separate also means 01_build_model_rdms.py can run without the
OSF files present at all.

THE FAILURE MODE THIS SCRIPT IS BUILT AROUND
--------------------------------------------
The embedding file and the name file are linked only by row position. Nothing
in either file enforces that link. If they ever fall out of step, every concept
silently receives another concept's vector, the RDM becomes meaningless, and
NOTHING downstream raises an error -- you would simply get a null result and
never learn why. Step 4 is the guard against that, and it is the step not to
skip.
"""

from __future__ import annotations

import difflib
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.spatial.distance import pdist

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

SPOSE_EMB   = Path("spose_embedding_66d_sorted.txt")
SPOSE_NAMES = Path("unique_id.txt")
INVENTORY   = Path("concept_inventory.csv")
OUT         = Path("conceptual_rdm_long.csv")

# Domains that get a conceptual RDM. Emotions is absent on purpose: facial
# expressions are not THINGS object concepts, so SPoSE has no vector for
# `happy` or `disgust`. Emotions still gets DINOv2 and CLIP.
CONCEPTUAL_DOMAINS = ["animals", "plants"]

# your base_name -> THINGS name, where they differ. Empty for the current
# stimulus set: all 24 concepts match THINGS exactly.
ALIASES: dict[str, str] = {}

# Concepts to print nearest neighbours for in the alignment check.
ALIGNMENT_PROBES = ["lion", "wolf", "dolphin", "butterfly", "peacock",
                    "apple", "broccoli", "tree", "grass", "acorn"]


# ---------------------------------------------------------------------------

def die(msg: str) -> None:
    sys.exit(f"\nERROR: {msg}\n")


def load_embedding(path: Path) -> np.ndarray:
    if not path.is_file():
        die(f"{path.resolve()} not found.\n"
            f"Download the THINGS behavioural data from https://osf.io/f5rn6/")
    for sep in ("\t", None, ","):
        try:
            m = np.loadtxt(path, delimiter=sep)
        except Exception:
            continue
        if m.ndim == 2 and m.shape[0] > 1000:
            return m
    die(f"could not parse {path} as a numeric matrix. Expected about "
        f"1854 rows x 66 columns.")


def load_names(path: Path) -> list[str]:
    """
    Read as PLAIN LINES. Never let pandas sniff a delimiter on a
    one-name-per-line file: given 'peacock' it will cheerfully decide the
    separator is 'c' and hand back 'pea'. This actually happened.
    """
    if not path.is_file():
        die(f"{path.resolve()} not found. It ships with the OSF download.")
    lines = [l.strip().strip('"')
             for l in path.read_text(encoding="utf-8",
                                     errors="replace").splitlines()]
    return [l.lower().replace(" ", "_") for l in lines if l]


def r_dist_order(n: int) -> list[tuple[int, int]]:
    """
    Pair indices in R's dist() order, verified against scipy at runtime.

    R's dist() returns the LOWER triangle, COLUMN-major:
        (2,1), (3,1), ..., (n,1), (3,2), (4,2), ...
    scipy's pdist() returns the UPPER triangle, ROW-major. For a symmetric
    matrix those are the same sequence of pairs -- but this proves it on a
    probe matrix rather than trusting anyone's memory, because if it is wrong
    every correlation downstream is wrong with no symptom.
    """
    pairs = [(i, j) for j in range(n) for i in range(j + 1, n)]
    probe = np.arange(n * 2, dtype=float).reshape(n, 2)
    r_like = np.array([np.linalg.norm(probe[i] - probe[j]) for i, j in pairs])
    if not np.allclose(pdist(probe), r_like):
        die("scipy pair order does not match R's dist() order on this "
            "machine. Do not use the output.")
    return [(j, i) for i, j in pairs]          # (concept_a, concept_b)


def main() -> None:

    # --- 1. load and check shape -------------------------------------------
    print("[1/6] loading the SPoSE embedding and the concept names")
    emb = load_embedding(SPOSE_EMB)
    names = load_names(SPOSE_NAMES)
    print(f"  embedding : {SPOSE_EMB.name}  shape {emb.shape}")
    print(f"  names     : {SPOSE_NAMES.name}  n = {len(names)}")
    print(f"  first 5   : {', '.join(names[:5])}")
    if emb.shape[0] != len(names):
        die(f"row-count mismatch: embedding has {emb.shape[0]} rows, the name "
            f"list has {len(names)}. They must correspond row for row.")

    # --- 2. sanity-check the values ----------------------------------------
    print("\n[2/6] checking the values")
    neg = emb[emb < 0]
    print(f"  range {emb.min():.2e} to {emb.max():.3f}")
    if neg.size:
        frac = 100 * neg.size / emb.size
        print(f"  {neg.size} of {emb.size} entries negative ({frac:.3f}%), "
              f"smallest {emb.min():.2e}")
        if emb.min() < -0.01:
            die("the embedding has substantially negative weights. SPoSE is "
                "non-negative by construction, so this is probably the wrong "
                "file.")
        print("  -> rounding artefacts in the published file, not real weights")
    else:
        print("  all non-negative, as SPoSE should be")

    # --- 3. match your concepts to THINGS ----------------------------------
    print("\n[3/6] matching your concepts to THINGS names")
    if not INVENTORY.is_file():
        die(f"{INVENTORY.resolve()} not found.\n"
            f"It is written by the `save` chunk of kidsnet_analysis.qmd.")
    inv = pd.read_csv(INVENTORY)
    need = {"category", "base_name"}
    if not need.issubset(inv.columns):
        die(f"{INVENTORY} must have columns {sorted(need)}; "
            f"found {sorted(inv.columns)}")

    index = {n: i for i, n in enumerate(names)}
    mapping: dict[str, int] = {}
    unmatched: list[tuple[str, str, str]] = []
    for cat in sorted(inv["category"].unique()):
        cs = sorted(inv.loc[inv["category"] == cat, "base_name"].unique())
        hits = []
        for c in cs:
            target = ALIASES.get(c, c)
            if target in index:
                mapping[c] = index[target]
                hits.append(c)
            elif cat in CONCEPTUAL_DOMAINS:
                near = difflib.get_close_matches(target, names, n=6, cutoff=0.5)
                unmatched.append((c, target, " | ".join(near)))
        note = "" if cat in CONCEPTUAL_DOMAINS else "  (no conceptual RDM wanted)"
        print(f"  {cat:9} {len(hits)}/{len(cs)} matched{note}")

    if unmatched:
        print("\n  Could not match these:")
        for c, t, near in unmatched:
            print(f"    {c:<14} tried '{t}'  -> {near or '(no close match)'}")
        die("add the right names to ALIASES and re-run. A domain gets no "
            "conceptual RDM until EVERY concept in it matches -- a partial "
            "one would change the pair set and break alignment with the "
            "children's distance vectors.")

    # --- 4. verify the row alignment ---------------------------------------
    print("\n[4/6] verifying that the embedding rows and the names correspond")
    print("  Nearest THINGS concepts in SPoSE space. These MUST look sensible:")
    norm = emb / (np.linalg.norm(emb, axis=1, keepdims=True) + 1e-12)
    for c in ALIGNMENT_PROBES:
        if c not in mapping:
            continue
        i = mapping[c]
        sim = norm @ norm[i]
        sim[i] = -np.inf
        near = ", ".join(names[j] for j in np.argsort(-sim)[:5])
        print(f"    {c:<11} -> {near}")
    print("\n  If those look random (apple -> ruler, pencil, eraser), the two")
    print("  files are NOT in the same row order. Stop here if so: nothing")
    print("  downstream will warn you, you will just get a null result.")

    # --- 5. build the RDMs --------------------------------------------------
    print("\n[5/6] building the RDMs")
    rows = []
    for cat in CONCEPTUAL_DOMAINS:
        cs = sorted(inv.loc[inv["category"] == cat, "base_name"].unique())
        if len(cs) < 3:
            print(f"  {cat}: skipped, only {len(cs)} concepts")
            continue
        n = len(cs)
        order = r_dist_order(n)
        M = np.vstack([emb[mapping[c]] for c in cs])
        ut = np.triu_indices(n, 1)

        # "conceptual" uses the DOT PRODUCT: SPoSE's own similarity, the
        # quantity the model uses to predict odd-one-out choices. Sign-flipped
        # so that larger means further apart, matching every other distance
        # column in the pipeline.
        #
        # "conceptual_cosine" normalises vector length away. On this stimulus
        # set the two correlate about .90-.93 (Spearman), so it is a real
        # choice, not a formality -- worth reporting as a robustness check.
        for model, d in (("conceptual",        -(M @ M.T)[ut]),
                         ("conceptual_cosine", pdist(M, metric="cosine"))):
            assert len(d) == n * (n - 1) // 2 == len(order)
            rows.append(pd.DataFrame({
                "domain": cat,
                "model": model,
                "picture_set": "na",        # SPoSE has no images
                "pair_index": np.arange(1, len(d) + 1),
                "concept_a": [cs[a] for a, _ in order],
                "concept_b": [cs[b] for _, b in order],
                "distance": d,
            }))
        print(f"  {cat}: {n} concepts -> {n*(n-1)//2} pairs x 2 metrics")

    if not rows:
        die("no RDMs built.")
    long = pd.concat(rows, ignore_index=True)

    # independent re-derivation of the expected pair order
    for cat, g in long[long["model"] == "conceptual"].groupby("domain"):
        cs = sorted(inv.loc[inv["category"] == cat, "base_name"].unique())
        n = len(cs)
        lt = [(i, j) for j in range(n) for i in range(j + 1, n)]
        g = g.sort_values("pair_index")
        assert list(g["concept_a"]) == [cs[j] for _, j in lt]
        assert list(g["concept_b"]) == [cs[i] for i, _ in lt]
    print("  pair order re-verified against R's dist() for every domain")

    # --- 6. write and sanity-check -----------------------------------------
    long.to_csv(OUT, index=False)
    print(f"\n[6/6] wrote {OUT}  ({len(long)} rows)")
    print(long.groupby(["domain", "model"])
              .agg(n_pairs=("pair_index", "max"),
                   min_d=("distance", "min"),
                   max_d=("distance", "max")).round(3).to_string())

    print("\nClosest and farthest pairs -- eyeball these before trusting the file:")
    for cat, g in long[long["model"] == "conceptual"].groupby("domain"):
        g = g.sort_values("distance")
        close = "; ".join(f"{r.concept_a}-{r.concept_b}" for r in g.head(4).itertuples())
        far   = "; ".join(f"{r.concept_a}-{r.concept_b}" for r in g.tail(4).itertuples())
        print(f"  {cat:8} closest : {close}")
        print(f"  {cat:8} farthest: {far}")

    print(f"\nNext: 01_build_model_rdms.py reads {OUT} via PREBUILT_CONCEPTUAL.")


if __name__ == "__main__":
    main()
