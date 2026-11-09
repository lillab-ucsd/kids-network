# setup.R -- configuration and shared functions for the KidsNet Study 1
# analysis. Sourced by 00_assemble.qmd and 01-03.
#
# Study 1 is the three-domain sample in data_v4. Study 2 (data_v5) is not
# loaded here and nothing in this pipeline touches it.

# ---- packages ------------------------------------------------------------------
suppressPackageStartupMessages({
  library(tidyverse); library(jsonlite); library(here); library(conflicted)
})
conflicts_prefer(
  dplyr::filter, dplyr::select, dplyr::mutate, dplyr::summarise,
  dplyr::count, dplyr::arrange, dplyr::slice, dplyr::rename, dplyr::lag,
  purrr::map, here::here, .quiet = TRUE
)

# ---- paths ---------------------------------------------------------------------
CHILD_DIR <- here("..", "data", "data_v4")
ADULT_DIR <- "/Users/apple/Desktop/UCSD/kidsnet-adult/exp0_adult/data"
AGE_FILE  <- here("age_sheet.csv")
RDM_FILE  <- here("model_rdms_long.csv")

CHILD_LABEL <- "study1"

# ---- domains -------------------------------------------------------------------
# The three domains Study 1 collected.
DOMAINS <- c("animals", "plants", "emotions")

# Adults were run on all six domains, so their files must parse in full before
# being restricted to the three above. The other three are reported, then
# dropped.
DOMAIN_CONCEPTS <- list(
  animals  = c("butterfly","dolphin","fish","fox","horse","ladybug",
               "lion","peacock","pigeon","sheep","squirrel","wolf"),
  plants   = c("acorn","apple","blueberry","broccoli","cabbage","cactus",
               "cherry","flower","grass","leaf","peanut","tree"),
  emotions = c("angry","disgust","fearful","happy","sad","surprise"),
  vehicle  = c("airplane","bike","boat","bus","car","firetruck",
               "helicopter","motorcycle","sled","stroller","train","truck"),
  clothing = c("boot","coat","dress","hat","necklace","pants",
               "scarf","shirt","shoe","shorts","sock","sweater"),
  household_items = c("bed","bowl","camera1","chair","clock","lamp",
                      "pillow","plate","refrigerator","scissors","tape","vacuum")
)

# Animals and plants: 12 concepts, one photograph each per trial, different
# photographs in trial 1 and trial 2. Emotions: 6 concepts, two photographs
# each per trial (exemplars 1-2 in trial 1, 3-4 in trial 2).
EXEMPLARS_PER_CONCEPT <- c(animals = 1, plants = 1, emotions = 2)
ITEMS_PER_TRIAL <- 12

# Emotion words are not THINGS object concepts, so emotions has no
# conceptual reference.
CONCEPTUAL_DOMAINS <- c("animals", "plants")

# Child and adult experiments name two household photographs differently.
# Kept because the adult files are parsed in full.
CONCEPT_ALIASES <- c(camera = "camera1", fridge = "refrigerator")

DOMAIN_LEVELS <- DOMAINS
PALETTE <- c(animals = "#0F728B", plants = "#B8860B", emotions = "#F1731D")
MODEL_COLS <- c(perceptual = "#0F728B", conceptual = "#F1731D",
                hybrid = "#8E7CC3")
CLUST_COLS <- c("#5102A3", "#B43359", "#F1731D", "#F6D442", "#1D9E75", "#378ADD")

# ---- sample and exclusions -----------------------------------------------------
AGE_MIN <- 4        # inclusive
AGE_MAX <- 9        # exclusive

# The corrected estimator needs a denominator distinguishable from zero. At
# age 4 the pilot reliability was .034, which leaves the pooled denominator
# straddling zero and the estimator with no usable sampling distribution;
# simulation put its power at 4-6% however many children or trials are added.
# Four-year-olds therefore contribute to every directly measured outcome and
# are excluded from the reference-based ones.
CORRECTED_AGE_MIN <- 5

# Practice trial 2 only. Four scored items, threshold three.
APPLY_COMPREHENSION <- TRUE
MIN_CHECKS <- 3
MIN_TRIALS <- 2     # the cross-trial estimator needs two independent trials

# ---- analysis constants --------------------------------------------------------
MIN_BIN_N <- 5
N_PERM    <- 1000
N_BOOT    <- 2000
K_CLUSTER <- 3
LINKAGE   <- "average"

set.seed(42)

# ---- task geometry -------------------------------------------------------------
# The Study 1 experiment script is not part of this pipeline, so the arena is
# measured from the data rather than assumed. Release positions are clamped to
# the arena interior, which shows up as a spike of identical values at each
# extreme. This is kept only to confirm the child and adult arenas are the same
# size: distances are raw pixels, so a different clamp would put the two groups
# on different scales and silently break every child-adult correlation.

infer_geometry <- function(df) {
  x <- df$posX[is.finite(df$posX)]
  y <- df$posY[is.finite(df$posY)]
  stopifnot(length(x) > 0, length(y) > 0)
  list(x_min = min(x), x_max = max(x),
       y_min = min(y), y_max = max(y),
       n_at_x_min = sum(abs(x - min(x)) < 0.51),
       n_at_x_max = sum(abs(x - max(x)) < 0.51),
       n_items = length(x))
}

describe_geometry <- function(g) {
  tibble(x_min = g$x_min, x_max = g$x_max, y_min = g$y_min, y_max = g$y_max,
         pct_at_x_min = round(100 * g$n_at_x_min / g$n_items, 2),
         pct_at_x_max = round(100 * g$n_at_x_max / g$n_items, 2))
}

# ---- comprehension -------------------------------------------------------------
# Study 1 asks no comprehension question; practice trial 2 is scored instead,
# against explicit acceptable neighbours. Croissant is the deliberate bridge
# item: present in the trial but not scored itself, and allowed as a neighbour
# for the sweets, because a pastry could plausibly go with them.
PRACTICE_TRIAL <- -2

PRACTICE_ACCEPTABLE <- list(
  toast     = c("bread", "croissant"),
  bread     = c("toast", "croissant"),
  chocolate = c("croissant", "candy"),
  candy     = c("croissant", "chocolate")
)
N_CHECKS <- length(PRACTICE_ACCEPTABLE)

# Adults and Study 2 children see a different practice trial: two hammers, two
# teddy bears and a block, grouped as tools vs toys. Scoring runs on base_name,
# so the two hammers share one name -- "hammer" being acceptable for "hammer"
# means the twin, since nothing else in the trial carries that name. All five
# items are scored, unlike the food set where croissant is a bridge item.
PRACTICE_ACCEPTABLE_ADULT <- list(
  hammer     = "hammer",
  teddy_bear = c("teddy_bear", "block"),
  block      = "teddy_bear"
)
# Chance is 2.0 of 5 (hammers 1 in 4 each, the three toys 2 in 4 each);
# P(>= 4 correct | random placement) = 15.9%, so this is a real screen.
N_CHECKS_ADULT   <- 5
MIN_CHECKS_ADULT <- 4

# Set FALSE to report the adult screen without acting on it.
APPLY_ADULT_COMPREHENSION <- TRUE

# ---- loading -------------------------------------------------------------------
normalize_pid <- function(x) {
  str_extract(as.character(x), "\\d+") %>% str_pad(width = 3, pad = "0") %>%
    str_c("p", .)
}

load_folder <- function(folder, normalize_ids = TRUE) {
  if (!dir.exists(folder)) {
    parent <- dirname(folder)
    sibs <- if (dir.exists(parent))
      paste(list.dirs(parent, recursive = FALSE, full.names = FALSE),
            collapse = ", ") else "(parent missing)"
    stop("No such folder: ", folder, "\n  Folders in ", parent, ": ", sibs)
  }
  files <- list.files(folder, pattern = "\\.csv$", full.names = TRUE)
  if (!length(files)) stop("No CSVs in ", folder)
  out <- map_dfr(files, ~ read_csv(.x, col_types = cols(.default = "c")))
  if (!"participant_id" %in% names(out))
    stop("No participant_id column in ", folder)
  if (normalize_ids)
    out <- mutate(out, participant_id = normalize_pid(participant_id))
  mutate(out, participant_id = as.character(participant_id))
}

# The `participant` column holds "demo" on practice rows; participant_id is
# the one that is correct throughout.
extract_placements <- function(row, source_col = "placements") {
  raw <- row[[source_col]]
  if (is.null(raw) || is.na(raw) || raw %in% c("", "[]")) return(NULL)
  parsed <- tryCatch(fromJSON(raw), error = function(e) NULL)
  if (is.null(parsed) || !is.data.frame(parsed) || !nrow(parsed)) return(NULL)
  if (!all(c("posX", "posY") %in% names(parsed))) return(NULL)
  img <- if ("image_name" %in% names(parsed)) "image_name"
         else if ("image" %in% names(parsed)) "image" else return(NULL)

  as_tibble(parsed) %>%
    transmute(participant_id = row$participant_id,
              block = suppressWarnings(as.numeric(row$block)),
              trial = suppressWarnings(as.numeric(row$trial)),
              image_name = .data[[img]],
              posX = suppressWarnings(as.numeric(posX)),
              posY = suppressWarnings(as.numeric(posY)))
}

tag_categories <- function(df) {
  lookup <- imap_dfr(DOMAIN_CONCEPTS, ~ tibble(base_name = .x, category = .y))
  df %>%
    mutate(image_stem = str_remove(image_name, "\\.[A-Za-z0-9]+$"),
           raw_name   = str_remove(image_stem, "_\\d+$"),
           base_name  = coalesce(unname(CONCEPT_ALIASES[raw_name]), raw_name),
           exemplar   = as.integer(str_extract(image_stem, "\\d+$"))) %>%
    left_join(lookup, by = "base_name")
}

load_placements <- function(folder, label, normalize_ids = TRUE,
                            use_category_order = FALSE) {
  raw <- load_folder(folder, normalize_ids = normalize_ids)

  grid_type <- unique(raw$trial_type)
  grid_type <- grid_type[str_detect(grid_type, "grid|sort|arrange")]
  if (!length(grid_type))
    stop("No arrangement trial_type in ", folder, ". Types: ",
         paste(unique(raw$trial_type), collapse = ", "))

  main <- raw %>%
    filter(trial_type %in% grid_type,
           !is.na(placements), !placements %in% c("", "[]"),
           !is.na(block), block != "null")
  # Not every version of the experiment records a phase column.
  if ("phase" %in% names(main))
    main <- filter(main, is.na(phase) | phase == "main")

  if (!nrow(main)) stop("No main arrangement rows in ", folder)

  rows <- split(main, seq_len(nrow(main)))

  out <- map_dfr(rows, extract_placements) %>%
    filter(!is.na(trial), trial > 0) %>%
    tag_categories() %>%
    mutate(sample = label)

  # Adults do not record the domain on the arrangement row, so theirs comes
  # from category_order indexed by block.
  disagree <- NULL
  if ("category" %in% names(main)) {
    on_row <- main %>%
      transmute(participant_id,
                trial = suppressWarnings(as.numeric(trial)),
                category_on_row = category)
    out <- out %>%
      rename(category_from_images = category) %>%
      left_join(on_row, by = c("participant_id", "trial")) %>%
      mutate(category = coalesce(category_on_row, category_from_images))
    disagree <- out %>%
      filter(!is.na(category_on_row), !is.na(category_from_images),
             category_on_row != category_from_images) %>%
      count(category_on_row, category_from_images)
  } else if (use_category_order && "category_order" %in% names(main)) {
    from_order <- main %>%
      filter(!is.na(category_order)) %>%
      distinct(participant_id, category_order) %>%
      mutate(category = str_split(category_order, ",")) %>%
      unnest(category) %>%
      group_by(participant_id) %>%
      mutate(block = row_number(), category = str_trim(category)) %>%
      ungroup() %>%
      select(participant_id, block, category_from_order = category)
    out <- out %>%
      rename(category_from_images = category) %>%
      left_join(from_order, by = c("participant_id", "block")) %>%
      mutate(category = coalesce(category_from_order, category_from_images))
    disagree <- out %>%
      filter(!is.na(category_from_order), !is.na(category_from_images),
             category_from_order != category_from_images) %>%
      count(category_from_order, category_from_images)
  }

  # Picture set: for the object domains the exemplar index is the set; for
  # emotions, exemplars 1-2 are set 1 and 3-4 are set 2.
  out <- out %>%
    mutate(picture_set = if_else(category == "emotions",
                                 ceiling(exemplar / 2), as.numeric(exemplar)))

  attr(out, "raw") <- raw
  attr(out, "category_disagreement") <- disagree
  out
}

# ---- comprehension scoring -----------------------------------------------------
.empty_compr <- tibble(participant_id = character(), n_ok = integer(),
                       n_checks = integer())

score_comprehension <- function(raw, acceptable = PRACTICE_ACCEPTABLE) {
  grid_type <- unique(raw$trial_type)
  grid_type <- grid_type[str_detect(grid_type, "grid|sort|arrange")]

  rows <- raw %>%
    filter(trial_type %in% grid_type,
           !is.na(placements), !placements %in% c("", "[]")) %>%
    split(seq_len(nrow(.)))

  pl <- map_dfr(rows, extract_placements) %>%
    filter(!is.na(trial), trial == PRACTICE_TRIAL) %>%
    mutate(base_name = str_remove(
      str_remove(image_name, "\\.[A-Za-z0-9]+$"), "_\\d+$"))

  if (!nrow(pl)) return(.empty_compr)

  pl %>%
    group_by(participant_id) %>%
    group_modify(~ {
      if (nrow(.x) < 3) return(tibble())
      d <- as.matrix(dist(cbind(.x$posX, .x$posY)))
      diag(d) <- Inf
      tibble(item = .x$base_name,
             near = .x$base_name[apply(d, 1, which.min)])
    }) %>%
    ungroup() %>%
    filter(item %in% names(acceptable)) %>%
    # map2_lgl, not rowwise(): rowwise over a list looked up by a column of the
    # same frame is the pattern that bit us in the adult concept check.
    mutate(ok = map2_lgl(near, item, ~ .x %in% acceptable[[.y]])) %>%
    group_by(participant_id) %>%
    summarise(n_ok = sum(ok, na.rm = TRUE), n_checks = n(), .groups = "drop")
}

# ---- derived quantities --------------------------------------------------------
add_age_bins <- function(df) {
  df %>% mutate(age_bin = pmin(floor(age), AGE_MAX - 1),
                age_group = factor(age_bin, levels = AGE_MIN:(AGE_MAX - 1)),
                age_c = age - 6.5)
}

# Concept-level pairwise distances for one trial, in dist() element order over
# sorted concept names. A concept pair's distance is the mean over exemplar
# combinations, which is what makes emotions comparable across trials that
# used different faces. Within-concept distances come out of the same matrix.
trial_concept_dists <- function(df) {
  df <- arrange(df, base_name)
  concepts <- sort(unique(df$base_name))
  n <- length(concepts)
  if (n < 3) return(NULL)

  d <- as.matrix(dist(cbind(df$posX, df$posY)))
  g <- match(df$base_name, concepts)

  between <- numeric(n * (n - 1) / 2)
  k <- 0L
  for (j in seq_len(n - 1)) for (i in seq.int(j + 1, n)) {
    k <- k + 1L
    between[k] <- mean(d[g == i, g == j])
  }

  within <- map_dbl(seq_len(n), function(i) {
    ix <- which(g == i)
    if (length(ix) < 2) return(NA_real_)
    mean(d[ix, ix][lower.tri(diag(length(ix)))])
  })

  list(concepts = concepts, between = between,
       within = setNames(within, concepts))
}

trial_dist_vecs <- function(fp) {
  fp %>%
    group_by(sample, participant_id, category, trial) %>%
    nest() %>%
    ungroup() %>%
    mutate(parts = map(data, trial_concept_dists)) %>%
    filter(map_lgl(parts, ~ !is.null(.x))) %>%
    mutate(dvec = map(parts, "between"),
           concepts = map(parts, "concepts"),
           n_concepts = map_int(concepts, length)) %>%
    select(-data, -parts)
}

# Within-concept distance per trial: only emotions has two exemplars of a
# concept in one trial, so this is empty for animals and plants.
trial_within_dists <- function(fp) {
  fp %>%
    group_by(sample, participant_id, category, trial) %>%
    nest() %>%
    ungroup() %>%
    mutate(parts = map(data, trial_concept_dists)) %>%
    filter(map_lgl(parts, ~ !is.null(.x))) %>%
    mutate(w = map(parts, ~ enframe(.x$within, "base_name", "within_dist"))) %>%
    select(-data, -parts) %>%
    unnest(w) %>%
    filter(!is.na(within_dist))
}

participant_dist_vecs <- function(fp) {
  trial_dist_vecs(fp) %>%
    group_by(sample, participant_id, category) %>%
    filter(n_distinct(n_concepts) == 1) %>%
    summarise(dvec = list(reduce(dvec, `+`) / length(dvec)),
              concepts = list(first(concepts)),
              n_trials = n(), .groups = "drop")
}

compute_consistency <- function(fp) {
  trial_dist_vecs(fp) %>%
    group_by(sample, participant_id, category) %>%
    summarise(
      consistency = if (n() < 2 || n_distinct(n_concepts) > 1) NA_real_ else
        mean(combn(length(dvec), 2, function(ix)
          cor(dvec[[ix[1]]], dvec[[ix[2]]], method = "spearman"))),
      n_trials = n(), .groups = "drop")
}

# Spearman-Brown for a k-trial average.
sb <- function(r, k = 2) { r <- pmax(r, 0); k * r / (1 + (k - 1) * r) }

# ---- cross-trial estimator -----------------------------------------------------
.cen <- function(v) v - mean(v)
.cv  <- function(u, v) sum(.cen(u) * .cen(v)) / length(u)

# Per-child parts, averaged over all available trial pairs.
cross_trial_parts <- function(dvecs, reference) {
  stopifnot(length(dvecs) >= 2,
            all(lengths(dvecs) == length(reference)))
  pairs <- combn(length(dvecs), 2, simplify = FALSE)
  ca <- map_dbl(dvecs, ~ .cv(.x, reference))
  tibble(num = mean(map_dbl(pairs, ~ ca[.x[1]] * ca[.x[2]])),
         den = mean(map_dbl(pairs, ~ .cv(dvecs[[.x[1]]], dvecs[[.x[2]]]))),
         raw = cor(reduce(dvecs, `+`) / length(dvecs), reference,
                   method = "spearman"))
}

# The estimate is a squared correlation and is returned on that scale. The
# numerator and denominator are summed across children before dividing,
# because per-child ratios truncate asymmetrically at zero.
#
# Taking a square root here would require truncating at 1, and truncation
# bites hardest in the low-reliability young cells, which inflates the age
# slope: with no true development, the truncated square root recovered
# +.040 to +.049 per year in simulation against +.005 to +.015 for the
# untruncated ratio. Square roots are for display only.
pool_r2 <- function(num, den, var_ref) {
  N <- sum(num, na.rm = TRUE)
  D <- sum(den, na.rm = TRUE) * var_ref
  if (!is.finite(N) || !is.finite(D) || abs(D) < 1e-12) return(NA_real_)
  N / D
}

r_from_r2 <- function(r2) sign(r2) * sqrt(pmin(abs(r2), 1))

ref_variance <- function(v) sum((v - mean(v))^2) / length(v)

# ---- utilities -----------------------------------------------------------------
# print(x, n = Inf) partial-matches `n` to `na.print` on a plain data.frame.
show_all <- function(x, n = Inf) print(tibble::as_tibble(x), n = n)

safe_cor <- function(x, y, method = "pearson", min_n = 3) {
  ok <- is.finite(x) & is.finite(y)
  if (sum(ok) < min_n) return(NA_real_)
  if (sd(x[ok]) == 0 || sd(y[ok]) == 0) return(NA_real_)
  cor(x[ok], y[ok], method = method)
}

fct_domain <- function(x) factor(x, levels = intersect(DOMAIN_LEVELS, unique(x)))

# Concept names for each element of a distance vector, in dist() order.
pair_labels <- function(concepts) {
  n <- length(concepts)
  lt <- which(lower.tri(matrix(0, n, n)), arr.ind = TRUE)
  tibble(pair_index = seq_len(nrow(lt)),
         concept_a = concepts[lt[, "col"]],
         concept_b = concepts[lt[, "row"]])
}

# Rebuild a dist object from a stored distance vector, normalised to mean 1.
as_dist_vec <- function(v, labels) {
  stopifnot(length(v) == length(labels) * (length(labels) - 1) / 2)
  structure(v / mean(v), Size = length(labels), Labels = labels,
            Diag = FALSE, Upper = FALSE, method = "euclidean", class = "dist")
}

# Long-format RDM must be in R's dist() element order.
verify_pair_order <- function(rdm_long, domain_col = "domain") {
  for (dom in unique(rdm_long[[domain_col]])) {
    d <- rdm_long %>% filter(.data[[domain_col]] == dom) %>% arrange(pair_index)
    concepts <- sort(unique(c(d$concept_a, d$concept_b)))
    n <- length(concepts)
    if (nrow(d) != n * (n - 1) / 2)
      stop(dom, ": ", nrow(d), " pairs for ", n, " concepts")
    lt <- which(lower.tri(matrix(0, n, n)), arr.ind = TRUE)
    if (!identical(concepts[lt[, "col"]], d$concept_a) ||
        !identical(concepts[lt[, "row"]], d$concept_b))
      stop(dom, ": pair order does not match dist()")
  }
  invisible(TRUE)
}
