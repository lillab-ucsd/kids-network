#!/usr/bin/env python3
"""
01_build_model_rdms.py
======================
Build reference RDMs for the pilot domains and write them in the element order
R's dist() produces, so they line up with the distance vectors your
participant_dist_vecs() helper already returns.

    perceptual   DINOv2    image statistics, never saw a label
    hybrid       CLIP      visual input, language-shaped representation
    conceptual   SPoSE     66-dim embedding of human odd-one-out judgements
    dreamsim     DreamSim  optional; image statistics tuned to human
                           perceptual-similarity judgements. Sits between
                           DINOv2 and CLIP. Off by default.

SETUP
-----
    pip install torch torchvision transformers pillow scipy pandas numpy
    pip install dreamsim            # only if USE_DREAMSIM = True

    THINGS behavioural data, OSF project f5rn6:  https://osf.io/f5rn6/
    Put the 66-dim embedding (~1854 x 66, numeric) and the 1854 concept names
    (one per line, same row order) in SPOSE_DIR. Found by shape, so filenames
    do not matter -- but check the line the script prints.

RUN
---
    python3 01_build_model_rdms.py

OUTPUT
------
    model_rdms_long.csv       domain, model, picture_set, pair_index,
                              concept_a, concept_b, distance
    concept_match_report.csv  which concepts matched a THINGS name
    image_resolution.csv      which file on disk each image_name resolved to
"""

from __future__ import annotations

import difflib
import re
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.spatial.distance import pdist

# ---------------------------------------------------------------------------
# CONFIG
# ---------------------------------------------------------------------------

INVENTORY = Path("concept_inventory.csv")           # from 00_model_prep_checks.R
STIM_ROOT = Path("../experiment-scripts/stimuli")   # searched recursively
OUT_DIR = Path(".")

# If this file exists, the conceptual RDM is read from it and SPoSE is skipped
# entirely -- no OSF files needed. It must be in the same long format this
# script writes (domain, model, picture_set, pair_index, concept_a, concept_b,
# distance) with concepts in sort(base_name) order and pairs in R's dist()
# order. Set to None to build it from the SPoSE embedding instead.
PREBUILT_CONCEPTUAL: Path | None = Path("conceptual_rdm_long.csv")

# Only used when PREBUILT_CONCEPTUAL is None or missing.
SPOSE_DIR = Path("./spose")

# How to turn the SPoSE embedding into distances.
#   "dot"     negative dot product -- SPoSE's OWN similarity, the quantity the
#             model uses to predict triplet choices. The default.
#   "cosine"  normalises vector length away. Correlates ~.90-.93 (Spearman)
#             with "dot" on these stimuli, so it is a real choice, not a
#             formality. Worth running as a robustness check.
# The image models keep cosine, which is standard for those embeddings: each
# model is read with its own native similarity.
SPOSE_METRIC = "dot"

# Domains that get a SPoSE (conceptual) RDM. Emotions is absent on purpose:
# facial expressions have no THINGS concept vector. It still gets DINOv2/CLIP.
CONCEPTUAL_DOMAINS = {"animals", "plants"}

# Which picture sets were shown TOGETHER in one trial. Take this straight from
# section A of 00_model_prep_checks.R, column `sets_used`.
#
#   animals / plants   sets_used is "1" in one trial and "2" in the other
#                      -> [[1], [2]]: one image per concept per trial
#   emotions           sets_used is "1+2" in one trial and "3+4" in the other
#                      -> [[1, 2], [3, 4]]: two images per concept on screen
#                         at once, so their embeddings are averaged BEFORE
#                         distances are computed, then the two trials' RDMs
#                         are averaged -- matching what your R pipeline does
#                         (mean posX/posY within base_name, then mean across
#                         trials).
#
# This distinction is not cosmetic: averaging embeddings and averaging
# distances give different RDMs. A domain not listed here falls back to one
# group per set.
SET_GROUPS: dict[str, list[list[int]]] = {
    "animals": [[1], [2]],
    "plants": [[1], [2]],
    "emotions": [[1, 2], [3, 4]],
}

# Your base_name -> THINGS concept name, where they differ. Run once; the
# script prints every concept it could not match plus close candidates from the
# THINGS list, and writes concept_match_report.csv. Fill this in from that.
ALIASES: dict[str, str] = {
    # "fish": "fish",
    # "leaf": "leaf",
    # "grass": "grass",
}

DINOV2_MODEL = "facebook/dinov2-base"
CLIP_MODEL = "openai/clip-vit-base-patch32"
USE_DREAMSIM = False

IMAGE_EXTS = {".jpg", ".jpeg", ".png", ".webp"}


# ---------------------------------------------------------------------------
# 1. INVENTORY AND IMAGE PATHS
# ---------------------------------------------------------------------------

def load_inventory(path: Path) -> pd.DataFrame:
    if not path.is_file():
        sys.exit(f"ERROR: {path.resolve()} not found.\n"
                 f"Run 00_model_prep_checks.R first -- it writes this file.")
    inv = pd.read_csv(path, dtype={"category": str, "base_name": str,
                                   "image_name": str})
    need = {"category", "base_name", "set", "image_name"}
    if not need.issubset(inv.columns):
        sys.exit(f"ERROR: {path} must have columns {sorted(need)}; "
                 f"found {sorted(inv.columns)}")
    inv["set"] = pd.to_numeric(inv["set"], errors="coerce").astype("Int64")
    inv = inv.drop_duplicates(subset=["category", "base_name", "set",
                                      "image_name"])
    return inv.sort_values(["category", "base_name", "set"]).reset_index(drop=True)


def resolve_paths(inv: pd.DataFrame, stim_root: Path) -> pd.DataFrame:
    """
    Match each image_name to a file under stim_root. Matching on basename keeps
    this independent of how the stimulus folders are arranged.
    """
    if not stim_root.is_dir():
        sys.exit(f"ERROR: no such folder: {stim_root.resolve()}\n"
                 f"Point STIM_ROOT at the directory holding your stimuli.")

    index: dict[str, list[Path]] = {}
    for p in stim_root.rglob("*"):
        if p.is_file() and p.suffix.lower() in IMAGE_EXTS:
            index.setdefault(p.name, []).append(p)
    if not index:
        sys.exit(f"ERROR: found no images under {stim_root.resolve()}")

    paths, notes = [], []
    for name in inv["image_name"]:
        hits = index.get(name, [])
        if len(hits) == 1:
            paths.append(str(hits[0]))
            notes.append("ok")
        elif len(hits) > 1:
            paths.append(str(sorted(hits)[0]))
            notes.append(f"AMBIGUOUS ({len(hits)} files with this name)")
        else:
            paths.append(None)
            notes.append("MISSING")

    inv = inv.assign(path=paths, resolution=notes)
    inv.to_csv(OUT_DIR / "image_resolution.csv", index=False)

    bad = inv[inv["resolution"] != "ok"]
    if len(bad):
        print("\n  Problems resolving image files:")
        for _, r in bad.head(20).iterrows():
            print(f"    {r['image_name']:<28} {r['resolution']}")
        if len(bad) > 20:
            print(f"    ... and {len(bad) - 20} more")
        print("  Full list: image_resolution.csv")
        if (inv["resolution"] == "MISSING").any():
            sys.exit("ERROR: some images the children saw are not on disk. "
                     "Fix STIM_ROOT or the filenames, then re-run.")

    inv["row"] = np.arange(len(inv))      # position in the embedding matrices
    return inv


# ---------------------------------------------------------------------------
# 2. EMBEDDINGS
# ---------------------------------------------------------------------------

def embed_dinov2(paths: list[str], batch_size: int = 16) -> np.ndarray:
    import torch
    from PIL import Image
    from transformers import AutoImageProcessor, AutoModel

    proc = AutoImageProcessor.from_pretrained(DINOV2_MODEL)
    model = AutoModel.from_pretrained(DINOV2_MODEL).eval()

    out = []
    with torch.no_grad():
        for i in range(0, len(paths), batch_size):
            imgs = [Image.open(p).convert("RGB") for p in paths[i:i + batch_size]]
            inputs = proc(images=imgs, return_tensors="pt")
            out.append(model(**inputs).last_hidden_state[:, 0].cpu().numpy())
            print(f"  DINOv2   {min(i + batch_size, len(paths))}/{len(paths)}",
                  end="\r")
    print()
    return np.vstack(out)


def embed_clip(paths: list[str], batch_size: int = 16) -> np.ndarray:
    import torch
    from PIL import Image
    from transformers import CLIPModel, CLIPProcessor

    proc = CLIPProcessor.from_pretrained(CLIP_MODEL)
    model = CLIPModel.from_pretrained(CLIP_MODEL).eval()

    out = []
    with torch.no_grad():
        for i in range(0, len(paths), batch_size):
            imgs = [Image.open(p).convert("RGB") for p in paths[i:i + batch_size]]
            inputs = proc(images=imgs, return_tensors="pt")
            out.append(model.get_image_features(**inputs).cpu().numpy())
            print(f"  CLIP     {min(i + batch_size, len(paths))}/{len(paths)}",
                  end="\r")
    print()
    return np.vstack(out)


def embed_dreamsim(paths: list[str]) -> np.ndarray:
    """
    DreamSim exposes an embedding, so it slots in with the same cosine-distance
    treatment as the others. Note what it is: image features fine-tuned on
    human similarity judgements, so it is NOT a label-free perceptual baseline
    the way DINOv2 is. Use it as an extra point on the continuum.
    """
    import torch
    from PIL import Image
    from dreamsim import dreamsim

    model, preprocess = dreamsim(pretrained=True)
    model = model.eval()

    out = []
    with torch.no_grad():
        for i, p in enumerate(paths, start=1):
            img = preprocess(Image.open(p).convert("RGB"))
            out.append(model.embed(img).cpu().numpy().reshape(1, -1))
            print(f"  DreamSim {i}/{len(paths)}", end="\r")
    print()
    return np.vstack(out)


# ---------------------------------------------------------------------------
# 3. SPoSE
# ---------------------------------------------------------------------------

def load_spose(spose_dir: Path) -> tuple[list[str], np.ndarray]:
    if not spose_dir.is_dir():
        sys.exit(f"ERROR: no such folder: {spose_dir.resolve()}\n"
                 f"Download the THINGS behavioural data from "
                 f"https://osf.io/f5rn6/ and point SPOSE_DIR at it.")

    candidates = [p for p in sorted(spose_dir.rglob("*"))
                  if p.is_file() and p.suffix.lower() in {".txt", ".tsv", ".csv"}]

    # --- the numeric embedding ---------------------------------------------
    emb, emb_file = None, None
    for p in candidates:
        for sep in (None, "\t", ","):
            try:
                m = np.loadtxt(p, delimiter=sep)
            except Exception:
                continue
            if m.ndim == 2 and m.shape[0] > 1000 and 20 <= m.shape[1] <= 120:
                emb, emb_file = m, p
                break
        if emb is not None:
            break
    if emb is None:
        sys.exit(f"ERROR: no SPoSE embedding found under {spose_dir.resolve()}.\n"
                 f"Expected a numeric text file of about 1854 rows x 66 columns.")
    n_rows = emb.shape[0]

    # --- the concept names --------------------------------------------------
    # Read as plain lines. Never let pandas sniff a delimiter here: on a
    # one-name-per-line file it will decide the separator is 'c' and silently
    # return 'pea' for 'peacock'.
    names, names_file = None, None
    for p in candidates:
        if p == emb_file:
            continue
        try:
            lines = [ln.rstrip("\n\r") for ln in
                     p.read_text(encoding="utf-8", errors="replace").splitlines()]
        except Exception:
            continue
        lines = [ln for ln in lines if ln.strip()]
        if len(lines) not in (n_rows, n_rows + 1):
            continue
        if len(lines) == n_rows + 1:
            lines = lines[1:]
        if any(("\t" in ln or "," in ln) for ln in lines[:20]):
            sep = "\t" if "\t" in lines[0] else ","
            cols = list(zip(*[ln.split(sep) for ln in lines]))
            pick = next((c for c in cols
                         if np.mean([bool(re.search("[A-Za-z]", v)) for v in c]) > 0.9),
                        None)
            if pick is None:
                continue
            lines = list(pick)
        if np.mean([bool(re.search("[A-Za-z]", v)) for v in lines]) > 0.9:
            names, names_file = lines, p
            break

    if names is None:
        sys.exit(f"ERROR: no concept-name list found under {spose_dir.resolve()}.\n"
                 f"Expected one THINGS concept name per line, {n_rows} rows, in "
                 f"the same order as {emb_file.name}.")

    print(f"  embedding : {emb_file.name}  shape {emb.shape}")
    print(f"  concepts  : {names_file.name}  n = {len(names)}")
    print(f"  first 5   : {', '.join(names[:5])}")

    names = [s.strip().strip('"').lower().replace(" ", "_") for s in names]
    return names, emb


def check_spose_alignment(names: list[str], emb: np.ndarray,
                          mapping: dict[str, int]) -> None:
    """
    The dangerous silent failure: the embedding matrix and the name list load
    fine but their row orders do not correspond, so every concept gets another
    concept's vector. Nothing downstream would complain -- you would just get
    a conceptual RDM that is quietly meaningless.

    Catch it by looking at nearest neighbours. If 'lion' comes back near
    'tiger' and 'leopard', the rows are aligned. If it comes back near
    'stapler', they are not.
    """
    if not mapping:
        return
    norm = emb / (np.linalg.norm(emb, axis=1, keepdims=True) + 1e-12)
    print("\n  Nearest THINGS concepts in SPoSE space -- these must look "
          "sensible:")
    for c in sorted(mapping)[:8]:
        i = mapping[c]
        sim = norm @ norm[i]
        sim[i] = -np.inf
        near = [names[j] for j in np.argsort(-sim)[:5]]
        print(f"    {c:<14} -> {', '.join(near)}")
    print("  If these look random, the embedding and the name list are not in\n"
          "  the same row order. Fix that before using the conceptual RDM --\n"
          "  nothing downstream will warn you.")


def match_concepts(ours: list[str], things: list[str],
                   aliases: dict[str, str]) -> tuple[dict[str, int], pd.DataFrame]:
    index = {n: i for i, n in enumerate(things)}
    mapping, report = {}, []
    for c in ours:
        target = aliases.get(c, c)
        if target in index:
            mapping[c] = index[target]
            report.append({"concept": c, "things_name": target,
                           "status": "matched", "suggestions": ""})
        else:
            near = difflib.get_close_matches(target, things, n=6, cutoff=0.5)
            report.append({"concept": c, "things_name": target,
                           "status": "NOT FOUND", "suggestions": " | ".join(near)})
    return mapping, pd.DataFrame(report)


# ---------------------------------------------------------------------------
# 4. RDMs
# ---------------------------------------------------------------------------

def check_pair_order(n: int) -> list[tuple[int, int]]:
    """
    Return pair indices in R's dist() order, and assert scipy agrees.
    R stores the lower triangle column-major: (2,1),(3,1),...,(n,1),(3,2),...
    scipy's pdist returns the upper triangle row-major, which for a symmetric
    matrix is the same sequence of pairs. Verified here rather than trusted.
    """
    pairs = [(i, j) for j in range(n) for i in range(j + 1, n)]
    probe = np.arange(n * 2, dtype=float).reshape(n, 2)
    r_like = np.array([np.linalg.norm(probe[i] - probe[j]) for i, j in pairs])
    if not np.allclose(pdist(probe), r_like):
        sys.exit("ERROR: scipy pair order does not match R's dist() order. "
                 "Do not trust the output.")
    return [(j, i) for i, j in pairs]      # (concept_a, concept_b)


def rdm_long(domain: str, model: str, picture_set: str,
             concepts: list[str], M: np.ndarray,
             metric: str = "cosine") -> pd.DataFrame:
    n = len(concepts)
    order = check_pair_order(n)
    if metric == "dot":
        # negative dot product: SPoSE's own similarity, sign-flipped so that
        # larger means farther apart, like every other column here
        d = -(M @ M.T)[np.triu_indices(n, 1)]
    else:
        d = pdist(M, metric=metric)
    assert len(d) == n * (n - 1) // 2 == len(order)
    return pd.DataFrame({
        "domain": domain,
        "model": model,
        "picture_set": picture_set,
        "pair_index": np.arange(1, len(d) + 1),
        "concept_a": [concepts[a] for a, _ in order],
        "concept_b": [concepts[b] for _, b in order],
        "distance": d,
    })


def image_rdms(domain: str, model: str, grp: pd.DataFrame,
               E: np.ndarray) -> list[pd.DataFrame]:
    """
    One RDM per TRIAL (per group of picture sets shown together), plus their
    average, plus a single RDM from all exemplars pooled.

    Within a trial the child sees one group of sets, so the embeddings in that
    group are averaged per concept before distances are computed -- matching
    the mean(posX)/mean(posY) step in your pipeline. Across trials,
    participant_dist_vecs() averages the two distance VECTORS, so the model
    side averages the two RDMs rather than pooling the images.

    picture_set labels:
      "1", "2", "1+2", "3+4" ...  one trial's RDM
      "avg"                       mean of the per-trial RDMs -- correlate this
                                  against participant_dist_vecs() output
      "all"                       every exemplar pooled before distances; a
                                  cross-check, not the primary
    """
    concepts = sorted(grp["base_name"].unique())
    out: list[pd.DataFrame] = []

    groups = SET_GROUPS.get(
        domain, [[int(s)] for s in sorted(grp["set"].dropna().unique())])

    known = set(int(s) for s in grp["set"].dropna().unique())
    listed = {s for g in groups for s in g}
    if listed != known:
        print(f"  {domain}/{model}: WARNING SET_GROUPS lists {sorted(listed)} "
              f"but the data has sets {sorted(known)}")

    per_trial = []
    for g in groups:
        sub = grp[grp["set"].isin(g)]
        have = sub.groupby("base_name")["row"].apply(list)
        if set(have.index) != set(concepts):
            missing = sorted(set(concepts) - set(have.index))
            print(f"  {domain}/{model}: sets {g} skipped, no image for "
                  f"{missing[:4]}{'...' if len(missing) > 4 else ''}")
            continue
        label = "+".join(str(s) for s in g)
        rows = [E[have[c]].mean(axis=0) for c in concepts]
        tbl = rdm_long(domain, model, label, concepts, np.vstack(rows))
        per_trial.append(tbl)
        out.append(tbl)

    # --- average of the per-trial RDMs: the one to use ---------------------
    if len(per_trial) >= 2:
        base = per_trial[0].copy()
        base["distance"] = np.mean(
            [t["distance"].to_numpy() for t in per_trial], axis=0)
        base["picture_set"] = "avg"
        out.append(base)
        # How much does the choice of picture set matter? If these two RDMs
        # disagree, the stimulus images are carrying variance the concepts do
        # not, and no model correlation is cleanly about the concepts.
        if len(per_trial) == 2:
            r = np.corrcoef(per_trial[0]["distance"],
                            per_trial[1]["distance"])[0, 1]
            print(f"  {domain}/{model}: r between the two trials' RDMs = {r:.2f}")

    # --- all exemplars pooled ----------------------------------------------
    all_rows = grp.groupby("base_name")["row"].apply(list)
    if set(all_rows.index) == set(concepts):
        rows = [E[all_rows[c]].mean(axis=0) for c in concepts]
        out.append(rdm_long(domain, model, "all", concepts, np.vstack(rows)))

    return out


# ---------------------------------------------------------------------------
# MAIN
# ---------------------------------------------------------------------------

def main() -> None:
    print("\n[1/5] reading the concept inventory")
    inv = load_inventory(INVENTORY)
    print(inv.groupby("category").agg(images=("image_name", "size"),
                                      concepts=("base_name", "nunique"),
                                      sets=("set", "nunique")))

    print("\n[2/5] resolving image files")
    inv = resolve_paths(inv, STIM_ROOT)
    print(f"  {len(inv)} images resolved under {STIM_ROOT.resolve()}")

    print("\n[3/5] embedding images (first run downloads the models)")
    paths = inv["path"].tolist()
    emb = {"perceptual": embed_dinov2(paths), "hybrid": embed_clip(paths)}
    if USE_DREAMSIM:
        emb["dreamsim"] = embed_dreamsim(paths)

    print("\n[4/5] conceptual (SPoSE) RDM")
    conceptual_inv = inv[inv["category"].isin(CONCEPTUAL_DOMAINS)]
    skipped = sorted(set(inv["category"]) - CONCEPTUAL_DOMAINS)
    if skipped:
        print(f"  no conceptual RDM for: {', '.join(skipped)} "
              f"(not THINGS object concepts)")

    prebuilt = None
    if PREBUILT_CONCEPTUAL is not None and PREBUILT_CONCEPTUAL.is_file():
        prebuilt = pd.read_csv(PREBUILT_CONCEPTUAL)
        need = {"domain", "model", "picture_set", "pair_index",
                "concept_a", "concept_b", "distance"}
        if not need.issubset(prebuilt.columns):
            sys.exit(f"ERROR: {PREBUILT_CONCEPTUAL} must have columns "
                     f"{sorted(need)}; found {sorted(prebuilt.columns)}")
        # The concepts and their order must match this inventory exactly, or
        # the rows will not line up with the child distance vectors.
        for dom, g in prebuilt.groupby("domain"):
            want = sorted(inv.loc[inv["category"] == dom, "base_name"].unique())
            got = sorted(set(g["concept_a"]) | set(g["concept_b"]))
            if want != got:
                sys.exit(f"ERROR: {PREBUILT_CONCEPTUAL} domain '{dom}' covers "
                         f"{got}\n  but the inventory has {want}. Rebuild it.")
        print(f"  using prebuilt {PREBUILT_CONCEPTUAL} -- SPoSE not needed")
        print(prebuilt.groupby(["domain", "model"])["pair_index"]
                      .max().rename("n_pairs").reset_index().to_string(index=False))

    mapping, report = {}, pd.DataFrame()
    spose, things_names = None, []
    if prebuilt is None and len(conceptual_inv):
        things_names, spose = load_spose(SPOSE_DIR)
        mapping, report = match_concepts(
            sorted(conceptual_inv["base_name"].unique()), things_names, ALIASES)
        report.to_csv(OUT_DIR / "concept_match_report.csv", index=False)
        missing = report[report["status"] != "matched"]
        if len(missing):
            print("\n  Could not match these to THINGS concepts:")
            for _, r in missing.iterrows():
                print(f"    {r['concept']:<16} tried '{r['things_name']}'"
                      f"  -> {r['suggestions'] or '(no close match)'}")
            print("\n  Add the right names to ALIASES and re-run. Until every "
                  "concept in a domain matches, that domain gets no\n  "
                  "conceptual RDM -- a partial one would change the pair set "
                  "and break alignment with the child vectors.")
        else:
            print("  all concepts matched to THINGS")
        check_spose_alignment(things_names, spose, mapping)

    print("\n[5/5] building RDMs")
    out: list[pd.DataFrame] = []
    for domain, grp in inv.groupby("category"):
        concepts = sorted(grp["base_name"].unique())
        if len(concepts) < 3:
            print(f"  {domain}: skipped, only {len(concepts)} concepts")
            continue

        for model, E in emb.items():
            out.extend(image_rdms(domain, model, grp, E))

        if domain in CONCEPTUAL_DOMAINS and spose is not None:
            have = [c for c in concepts if c in mapping]
            if len(have) < len(concepts):
                print(f"  {domain}: conceptual RDM skipped "
                      f"({len(concepts) - len(have)} concepts unmatched)")
            else:
                M = np.vstack([spose[mapping[c]] for c in concepts])
                out.append(rdm_long(domain, "conceptual", "na", concepts, M,
                                    metric=SPOSE_METRIC))
                # the other metric, as a robustness check
                other = "cosine" if SPOSE_METRIC == "dot" else "dot"
                out.append(rdm_long(domain, f"conceptual_{other}", "na",
                                    concepts, M, metric=other))

    if prebuilt is not None:
        out.append(prebuilt[["domain", "model", "picture_set", "pair_index",
                             "concept_a", "concept_b", "distance"]])

    if not out:
        sys.exit("ERROR: no RDMs built.")

    long = pd.concat(out, ignore_index=True)
    long.to_csv(OUT_DIR / "model_rdms_long.csv", index=False)

    print("\ndone")
    print(long.groupby(["domain", "model", "picture_set"])["pair_index"]
              .max().rename("n_pairs").reset_index().to_string(index=False))
    print(f"\nwrote {OUT_DIR / 'model_rdms_long.csv'}")
    print("Next: 03_model_comparison.R")


if __name__ == "__main__":
    main()
