/*************************************************
 * KIDS SEMANTIC NETWORK DEMO - iPad friendly
 * 1 practice trial + 2 blocks
 * 3 trials per block
 * 12 images per main trial
 *
 * Changes for iPad:
 * - All "press any key" screens -> button response screens
 * - "Press N to continue" -> Continue button
 * - Removed keyboard dependency
 * - Added touch-friendly CSS
 * - End screen includes a manual CSV download button
 *************************************************/

const DEMO_PARTICIPANT = "demo";

const PRACTICE_IMAGES = [
  "stimuli/food/rice.jpg",
  "stimuli/food/pizza.jpg",
  "stimuli/food/ice_cream.jpg",
  "stimuli/food/chocolate.jpg",
  "stimuli/food/ham.jpg",
  "stimuli/food/salad.jpg"
];

const NUM_BLOCKS = 2;
const TRIALS_PER_BLOCK = 3;
const TOTAL_MAIN_TRIALS = NUM_BLOCKS * TRIALS_PER_BLOCK;

const MAIN_BLOCKS = [
  [
    [
      "stimuli/animals/peacock_1.jpg",
      "stimuli/animals/dolphin_1.jpg",
      "stimuli/animals/pigeon_1.jpg",
      "stimuli/animals/fox_1.jpg",
      "stimuli/animals/lion_1.jpg",
      "stimuli/animals/sheep_1.jpg",
      "stimuli/animals/horse_1.jpg",
      "stimuli/animals/fish_1.jpg",
      "stimuli/animals/squirrel_1.jpg",
      "stimuli/animals/butterfly_1.jpg",
      "stimuli/animals/ladybug_1.jpg",
      "stimuli/animals/wolf_1.jpg"
    ],
    [
      "stimuli/artifact/clock_1.jpg",
      "stimuli/artifact/envelope_1.jpg",
      "stimuli/artifact/fireworks_1.jpg",
      "stimuli/artifact/flag_1.jpg",
      "stimuli/artifact/ladder_1.jpg",
      "stimuli/artifact/mirror_1.jpg",
      "stimuli/artifact/snowman_1.jpg",
      "stimuli/artifact/tent_1.jpg",
      "stimuli/artifact/window_1.jpg",
      "stimuli/artifact/balloon_1.jpg",
      "stimuli/artifact/camera_1.jpg",
      "stimuli/artifact/candle_1.jpg"
    ],
    [
      "stimuli/plants/broccoli_1.jpg",
      "stimuli/plants/cabbage_1.jpg",
      "stimuli/plants/cactus_1.jpg",
      "stimuli/plants/cherry_1.jpg",
      "stimuli/plants/flower_1.jpg",
      "stimuli/plants/grass_1.jpg",
      "stimuli/plants/leaf_1.jpg",
      "stimuli/plants/tree_1.jpg",
      "stimuli/plants/acorn_1.jpg",
      "stimuli/plants/apple_1.jpg",
      "stimuli/plants/blueberry_1.jpg",
      "stimuli/plants/peanut_1.jpg"
    ]
  ],
  [
    [
      "stimuli/animals/peacock_2.jpg",
      "stimuli/animals/dolphin_2.jpg",
      "stimuli/animals/pigeon_2.jpg",
      "stimuli/animals/fox_2.jpg",
      "stimuli/animals/lion_2.jpg",
      "stimuli/animals/sheep_2.jpg",
      "stimuli/animals/horse_2.jpg",
      "stimuli/animals/fish_2.jpg",
      "stimuli/animals/squirrel_2.jpg",
      "stimuli/animals/butterfly_2.jpg",
      "stimuli/animals/ladybug_2.jpg",
      "stimuli/animals/wolf_2.jpg"
    ],
    [
      "stimuli/artifact/clock_2.jpg",
      "stimuli/artifact/envelope_2.jpg",
      "stimuli/artifact/fireworks_2.jpg",
      "stimuli/artifact/flag_2.jpg",
      "stimuli/artifact/ladder_2.jpg",
      "stimuli/artifact/mirror_2.jpg",
      "stimuli/artifact/snowman_2.jpg",
      "stimuli/artifact/tent_2.jpg",
      "stimuli/artifact/window_2.jpg",
      "stimuli/artifact/balloon_2.jpg",
      "stimuli/artifact/camera_2.jpg",
      "stimuli/artifact/candle_2.jpg"
    ],
    [
      "stimuli/plants/broccoli_2.jpg",
      "stimuli/plants/cabbage_2.jpg",
      "stimuli/plants/cactus_2.jpg",
      "stimuli/plants/cherry_2.jpg",
      "stimuli/plants/flower_2.jpg",
      "stimuli/plants/grass_2.jpg",
      "stimuli/plants/leaf_2.jpg",
      "stimuli/plants/tree_2.jpg",
      "stimuli/plants/acorn_2.jpg",
      "stimuli/plants/apple_2.jpg",
      "stimuli/plants/blueberry_2.jpg",
      "stimuli/plants/peanut_2.jpg"
    ]
  ]
];

const GRID_COLS = 10;
const GRID_ROWS = 6;
const CELL_SIZE = 90;
const CONFLICT_OFFSET = 50;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

/* ---------- Touch-friendly CSS ---------- */
(function injectTaskStyles() {
  const style = document.createElement("style");
  style.textContent = `
    #task-wrapper {
      max-width: 1200px;
      margin: 0 auto;
      text-align: center;
      font-family: Arial, sans-serif;
    }

    #trial-label {
      font-size: 26px;
      font-weight: 600;
      margin-bottom: 14px;
    }

    #task-instructions {
      font-size: 22px;
      line-height: 1.5;
      margin-bottom: 18px;
    }

    #grid-container {
      position: relative;
      width: ${GRID_WIDTH}px;
      height: ${GRID_HEIGHT + 320}px;
      margin: 0 auto;
      border: 2px solid #444;
      background: white;
      touch-action: none;
      user-select: none;
      -webkit-user-select: none;
      overflow: hidden;
    }

    .grid-line-v,
    .grid-line-h {
      position: absolute;
      background: #d0d0d0;
      pointer-events: none;
    }

    .grid-line-v {
      top: 0;
      width: 2px;
      height: ${GRID_HEIGHT}px;
    }

    .grid-line-h {
      left: 0;
      height: 2px;
      width: ${GRID_WIDTH}px;
    }

    .stim-img {
      position: absolute;
      width: 100px;
      height: 100px;
      object-fit: contain;
      transform: translate(-50%, -50%);
      touch-action: none;
      -webkit-user-drag: none;
      user-select: none;
    }

    .stim-img.dragging {
      z-index: 9999;
    }

    #warning-text {
      margin-top: 12px;
      min-height: 32px;
      font-size: 22px;
      color: #b00020;
      font-weight: 500;
    }

    .task-btn {
      font-size: 24px;
      padding: 14px 30px;
      border-radius: 12px;
      border: 1px solid #888;
      background: #f5f5f5;
      cursor: pointer;
      margin-top: 8px;
    }

    .task-btn:active {
      transform: scale(0.98);
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- Utility functions ---------- */

function getStartPositions(numImages) {
  const cols = 6;
  const rows = Math.ceil(numImages / cols);
  const spacingX = 140;
  const spacingY = 140;

  const totalWidth = spacingX * (cols - 1);
  const startX = (GRID_WIDTH - totalWidth) / 2;
  const startY = GRID_HEIGHT + 110;

  const positions = [];

  for (let i = 0; i < numImages; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push([
      startX + col * spacingX,
      startY + row * spacingY
    ]);
  }

  return positions;
}

function getFileName(path) {
  return path.split("/").pop();
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function centerCoordsToPx(x, y, rect) {
  const left = x + rect.width / 2;
  const top = rect.height / 2 - y;
  return [left, top];
}

function pxToCenterCoords(leftPx, topPx, rect) {
  const x = leftPx - rect.width / 2;
  const y = -(topPx - rect.height / 2);
  return [x, y];
}

function getGridCenters() {
  const centers = [];
  const totalWidth = GRID_COLS * CELL_SIZE;
  const totalHeight = GRID_ROWS * CELL_SIZE;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const left = col * CELL_SIZE + CELL_SIZE / 2;
      const top = row * CELL_SIZE + CELL_SIZE / 2;
      const x = left - totalWidth / 2;
      const y = -(top - totalHeight / 2);
      centers.push([x, y]);
    }
  }
  return centers;
}

const GRID_CENTERS = getGridCenters();

function nearestGridCenter(x, y) {
  let best = GRID_CENTERS[0];
  let bestDist = Infinity;

  for (const c of GRID_CENTERS) {
    const dx = x - c[0];
    const dy = y - c[1];
    const d = dx * dx + dy * dy;
    if (d < bestDist) {
      best = c;
      bestDist = d;
    }
  }
  return best;
}

function samePos(a, b) {
  return Math.round(a[0]) === Math.round(b[0]) &&
         Math.round(a[1]) === Math.round(b[1]);
}

function offsetFromQuadrant(x, y) {
  if (x > 0 && y > 0) return [x - CONFLICT_OFFSET, y - CONFLICT_OFFSET];
  if (x < 0 && y < 0) return [x + CONFLICT_OFFSET, y + CONFLICT_OFFSET];
  if (x > 0 && y < 0) return [x - CONFLICT_OFFSET, y + CONFLICT_OFFSET];
  if (x < 0 && y > 0) return [x + CONFLICT_OFFSET, y - CONFLICT_OFFSET];
  return [x + CONFLICT_OFFSET, y + CONFLICT_OFFSET];
}

function makeCSVContent(rows) {
  if (!rows.length) return "";

  const headers = Object.keys(rows[0]);
  return [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    )
  ].join("\n");
}

function downloadCSV(filename, rows) {
  if (!rows.length) return;

  const csv = makeCSVContent(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------- Custom plugin ---------- */

class EmotionGridPlugin {
  constructor(jsPsych) {
    this.jsPsych = jsPsych;
  }

  trial(display_element, trial) {
    const participant = trial.participant;
    const phase = trial.phase;
    const trialNumber = trial.trial_number;
    const totalTrials = trial.total_trials;
    const trialImages = trial.images;
    const blockNumber = trial.block_number ?? null;
    const trialNumberInBlock = trial.trial_number_in_block ?? trialNumber;
    const totalTrialsInBlock = trial.total_trials_in_block ?? totalTrials;

    const imageState = trialImages.map((imgPath, i) => ({
      path: imgPath,
      centerPos: null,
      index: i
    }));

    let dragState = null;
    let warningMessage = "";

    const trialLabel =
      phase === "practice"
        ? "Practice Trial"
        : `Block ${blockNumber}, Trial ${trialNumberInBlock} of ${totalTrialsInBlock}`;

    display_element.innerHTML = `
      <div id="task-wrapper">
        <div id="trial-label">${trialLabel}</div>
        <div id="task-instructions">
          Drag all ${trialImages.length} pictures into the grid.<br>
          Only one picture can occupy each square.<br>
          Tap <b>Continue</b> when all ${trialImages.length} pictures are placed.
        </div>
        <div id="grid-container"></div>
        <div id="warning-text"></div>
        <div>
          <button id="continue-btn" class="task-btn">Continue</button>
        </div>
      </div>
    `;

    const container = display_element.querySelector("#grid-container");
    const warningEl = display_element.querySelector("#warning-text");
    const continueBtn = display_element.querySelector("#continue-btn");

    for (let c = 1; c < GRID_COLS; c++) {
      const line = document.createElement("div");
      line.className = "grid-line-v";
      line.style.left = `${c * CELL_SIZE - 1}px`;
      container.appendChild(line);
    }

    for (let r = 1; r < GRID_ROWS; r++) {
      const line = document.createElement("div");
      line.className = "grid-line-h";
      line.style.top = `${r * CELL_SIZE - 1}px`;
      container.appendChild(line);
    }

    const getRect = () => container.getBoundingClientRect();
    const startPositions = getStartPositions(trialImages.length);

    imageState.forEach((item, i) => {
      const rect = getRect();
      const [left, top] = startPositions[i];
      item.centerPos = pxToCenterCoords(left, top, rect);
    });

    const imgEls = [];

    function isInsideGrid(centerPos) {
      const snapped = nearestGridCenter(centerPos[0], centerPos[1]);
      const dx = Math.abs(centerPos[0] - snapped[0]);
      const dy = Math.abs(centerPos[1] - snapped[1]);
      return dx <= CELL_SIZE / 2 && dy <= CELL_SIZE / 2;
    }

    function getSnappedOrNull(centerPos) {
      if (!isInsideGrid(centerPos)) return null;
      return nearestGridCenter(centerPos[0], centerPos[1]);
    }

    function allPlacedInUniqueSquares() {
      const snappedPositions = [];

      for (const item of imageState) {
        const snapped = getSnappedOrNull(item.centerPos);
        if (!snapped) return false;
        snappedPositions.push(`${Math.round(snapped[0])},${Math.round(snapped[1])}`);
      }

      return new Set(snappedPositions).size === imageState.length;
    }

    function renderImages() {
      imgEls.forEach(el => el.remove());
      imgEls.length = 0;

      const rect = getRect();

      imageState.forEach((item, index) => {
        const el = document.createElement("img");
        el.className = "stim-img";
        el.src = item.path;
        el.dataset.index = index;
        el.draggable = false;

        const [left, top] = centerCoordsToPx(item.centerPos[0], item.centerPos[1], rect);
        el.style.left = `${left}px`;
        el.style.top = `${top}px`;

        container.appendChild(el);
        imgEls.push(el);

        attachDragHandlers(el, index);
      });

      warningEl.textContent = warningMessage;
    }

    function updateOnePosition(index) {
      const el = imgEls[index];
      if (!el) return;

      const rect = getRect();
      const [left, top] = centerCoordsToPx(
        imageState[index].centerPos[0],
        imageState[index].centerPos[1],
        rect
      );

      el.style.left = `${left}px`;
      el.style.top = `${top}px`;
    }

    function attachDragHandlers(el, index) {
      const startDrag = (clientX, clientY) => {
        const imgRect = el.getBoundingClientRect();
        dragState = {
          index,
          offsetX: clientX - imgRect.left - imgRect.width / 2,
          offsetY: clientY - imgRect.top - imgRect.height / 2,
          pointerId: null
        };
        el.classList.add("dragging");
      };

      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (el.setPointerCapture) {
          el.setPointerCapture(e.pointerId);
        }
        startDrag(e.clientX, e.clientY);
        dragState.pointerId = e.pointerId;
      });

      el.addEventListener("pointermove", (e) => {
        if (!dragState || dragState.index !== index) return;

        const rect = getRect();
        let left = e.clientX - rect.left - dragState.offsetX;
        let top = e.clientY - rect.top - dragState.offsetY;

        left = clamp(left, 0, rect.width);
        top = clamp(top, 0, rect.height);

        imageState[index].centerPos = pxToCenterCoords(left, top, rect);
        updateOnePosition(index);
      });

      const finishDrag = () => {
        if (!dragState || dragState.index !== index) return;

        el.classList.remove("dragging");

        const currentPos = imageState[index].centerPos;
        const snapped = getSnappedOrNull(currentPos);

        if (!snapped) {
          warningMessage = "Each picture must end inside the grid.";
          dragState = null;
          renderImages();
          return;
        }

        let occupied = false;
        for (let i = 0; i < imageState.length; i++) {
          if (i === index) continue;
          const otherSnapped = getSnappedOrNull(imageState[i].centerPos);
          if (otherSnapped && samePos(otherSnapped, snapped)) {
            occupied = true;
            break;
          }
        }

        if (occupied) {
          imageState[index].centerPos = offsetFromQuadrant(currentPos[0], currentPos[1]);
          warningMessage = "That square is already occupied.";
        } else {
          imageState[index].centerPos = snapped;
          warningMessage = "";
        }

        dragState = null;
        renderImages();
      };

      el.addEventListener("pointerup", finishDrag);
      el.addEventListener("pointercancel", finishDrag);
    }

    continueBtn.addEventListener("click", () => {
      if (!allPlacedInUniqueSquares()) {
        warningMessage = `Place all ${trialImages.length} pictures into different grid squares first.`;
        renderImages();
        return;
      }

      imageState.forEach(item => {
        item.centerPos = getSnappedOrNull(item.centerPos);
      });

      const placements = imageState.map(item => ({
        participant,
        phase,
        block: blockNumber,
        trial: trialNumber,
        trial_in_block: trialNumberInBlock,
        image: getFileName(item.path),
        final_img_pos: `(${Math.round(item.centerPos[0])}, ${Math.round(item.centerPos[1])})`,
        posX: Math.round(item.centerPos[0]),
        posY: Math.round(item.centerPos[1])
      }));

      display_element.innerHTML = "";

      this.jsPsych.finishTrial({
        participant,
        phase,
        block: blockNumber,
        trial: trialNumber,
        trial_in_block: trialNumberInBlock,
        placements
      });
    });

    renderImages();
  }
}

EmotionGridPlugin.info = {
  name: "emotion-grid",
  parameters: {}
};

/* ---------- jsPsych setup ---------- */

const jsPsychInstance = initJsPsych({
  on_finish: function() {
    // No auto-download here.
    // We'll let the end screen handle downloading with a button.
  }
});

const allImagesToPreload = [
  ...PRACTICE_IMAGES,
  ...MAIN_BLOCKS.flat(2)
];

const preload_trial = {
  type: jsPsychPreload,
  images: allImagesToPreload
};

const intro_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:24px; line-height:1.6; max-width:1000px; margin:auto;">
      <p>This is a demo version.</p>
      <p>You will first complete <b>1 practice trial</b>.</p>
      <p>After that, you will complete <b>2 blocks</b> of trials.</p>
      <p>Each block contains <b>3 trials</b>, for a total of <b>6 main trials</b>.</p>
      <p>On each main trial, <b>12 pictures</b> will appear below the grid.</p>
      <p>Drag each picture into the grid and arrange them however you think is best.</p>
      <p>All pictures must end up inside the grid, and each square can hold only one picture.</p>
      <p>When all pictures are placed, tap <b>Continue</b> to move on.</p>
    </div>
  `,
  choices: ["Begin"]
};

const practice_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:26px; line-height:1.6;">
      Practice Trial<br><br>
      Tap below to begin.
    </div>
  `,
  choices: ["Start Practice"]
};

const practice_trial = {
  type: EmotionGridPlugin,
  participant: DEMO_PARTICIPANT,
  phase: "practice",
  trial_number: 0,
  total_trials: 1,
  images: PRACTICE_IMAGES
};

const main_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:26px; line-height:1.6;">
      The practice trial is complete.<br><br>
      You will now begin the main task.<br><br>
      There are <b>2 blocks</b>, with <b>3 trials per block</b>.<br><br>
      Tap below to continue.
    </div>
  `,
  choices: ["Start Main Task"]
};

const timeline = [
  preload_trial,
  intro_trial,
  practice_intro,
  practice_trial,
  main_intro
];

let globalTrialNumber = 1;

for (let b = 0; b < NUM_BLOCKS; b++) {
  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="font-size:26px; line-height:1.6;">
        Block ${b + 1} of ${NUM_BLOCKS}<br><br>
        This block has ${TRIALS_PER_BLOCK} trials.<br><br>
        Tap below to begin.
      </div>
    `,
    choices: ["Begin Block"]
  });

  for (let t = 0; t < TRIALS_PER_BLOCK; t++) {
    timeline.push({
      type: EmotionGridPlugin,
      participant: DEMO_PARTICIPANT,
      phase: "main",
      block_number: b + 1,
      trial_number: globalTrialNumber,
      trial_number_in_block: t + 1,
      total_trials: TOTAL_MAIN_TRIALS,
      total_trials_in_block: TRIALS_PER_BLOCK,
      images: MAIN_BLOCKS[b][t]
    });

    globalTrialNumber++;
  }
}

/* ---------- End screen with manual download ---------- */
timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:28px; line-height:1.6; max-width:900px; margin:auto;">
      Done. Thank you!<br><br>
      Tap <b>Download CSV</b> below to save your data.<br><br>
      Then tap <b>Finish</b>.
    </div>
  `,
  choices: ["Download CSV", "Finish"],
  on_finish: function(data) {
    // Button index 0 = Download CSV, 1 = Finish
    if (data.response === 0) {
      const rows = [];

      jsPsychInstance.data.get().values().forEach(d => {
        if (d.placements) {
          d.placements.forEach(row => rows.push(row));
        }
      });

      if (rows.length > 0) {
        downloadCSV(`${DEMO_PARTICIPANT}_emotion_grid_demo.csv`, rows);
      }
    }
  }
});

jsPsychInstance.run(timeline);