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

/* ---------- Global layout overrides for jsPsych ---------- */

(function injectGlobalOverrides() {
  const style = document.createElement("style");
  style.textContent = `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f7f7f7;
      font-family: Arial, sans-serif;
    }

    #jspsych-display-element {
      width: 100vw;
      height: 100vh;
      overflow: hidden;
    }

    #jspsych-content {
      max-width: none !important;
      width: 100vw !important;
      height: 100vh !important;
      margin: 0 !important;
      padding: 0 !important;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      box-sizing: border-box;
    }

    .task-btn {
      font-size: 20px;
      padding: 10px 22px;
      border-radius: 12px;
      border: 1px solid #888;
      background: #f5f5f5;
      cursor: pointer;
    }

    .task-btn:active {
      transform: scale(0.98);
    }

    .grid-line-v,
    .grid-line-h {
      position: absolute;
      background: #d0d0d0;
      pointer-events: none;
    }

    .stim-img {
      position: absolute;
      object-fit: contain;
      transform: translate(-50%, -50%);
      touch-action: none;
      -webkit-user-drag: none;
      user-select: none;
    }

    .stim-img.dragging {
      z-index: 9999;
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- Responsive layout ---------- */

function getLayoutSizes() {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

  const maxTaskWidth = Math.min(vw * 0.96, 1180);
  const maxGridHeight = vh * 0.42;

  const cellFromWidth = Math.floor(maxTaskWidth / GRID_COLS);
  const cellFromHeight = Math.floor(maxGridHeight / GRID_ROWS);

  const cellSize = Math.max(38, Math.min(cellFromWidth, cellFromHeight, 72));

  const gridWidth = GRID_COLS * cellSize;
  const gridHeight = GRID_ROWS * cellSize;

  const bottomArea = Math.max(120, Math.min(vh * 0.18, 170));
  const conflictOffset = Math.max(14, Math.round(cellSize * 0.3));
  const imgSize = Math.max(42, Math.min(76, Math.round(cellSize * 0.88)));

  return {
    VIEW_W: vw,
    VIEW_H: vh,
    CELL_SIZE: cellSize,
    GRID_WIDTH: gridWidth,
    GRID_HEIGHT: gridHeight,
    BOTTOM_AREA: bottomArea,
    CONFLICT_OFFSET: conflictOffset,
    IMG_SIZE: imgSize
  };
}

/* ---------- Utility functions ---------- */

function getStartPositions(numImages, layout) {
  const { GRID_WIDTH, GRID_HEIGHT, BOTTOM_AREA } = layout;

  const cols = 6;
  const rows = Math.ceil(numImages / cols);

  const spacingX = GRID_WIDTH / cols;
  const spacingY = Math.min(70, BOTTOM_AREA / rows);

  const startX = spacingX / 2;
  const startY = GRID_HEIGHT + Math.max(28, spacingY * 0.55);

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

function getGridCenters(layout) {
  const centers = [];
  const { GRID_WIDTH, GRID_HEIGHT, CELL_SIZE } = layout;

  for (let row = 0; row < GRID_ROWS; row++) {
    for (let col = 0; col < GRID_COLS; col++) {
      const left = col * CELL_SIZE + CELL_SIZE / 2;
      const top = row * CELL_SIZE + CELL_SIZE / 2;
      const x = left - GRID_WIDTH / 2;
      const y = -(top - GRID_HEIGHT / 2);
      centers.push([x, y]);
    }
  }
  return centers;
}

function nearestGridCenter(x, y, gridCenters) {
  let best = gridCenters[0];
  let bestDist = Infinity;

  for (const c of gridCenters) {
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

function offsetFromQuadrant(x, y, conflictOffset) {
  if (x > 0 && y > 0) return [x - conflictOffset, y - conflictOffset];
  if (x < 0 && y < 0) return [x + conflictOffset, y + conflictOffset];
  if (x > 0 && y < 0) return [x - conflictOffset, y + conflictOffset];
  if (x < 0 && y > 0) return [x + conflictOffset, y - conflictOffset];
  return [x + conflictOffset, y + conflictOffset];
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

    const layout = getLayoutSizes();
    const { CELL_SIZE, GRID_WIDTH, GRID_HEIGHT, BOTTOM_AREA, CONFLICT_OFFSET, IMG_SIZE } = layout;
    const GRID_CENTERS = getGridCenters(layout);

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
      <div id="task-wrapper" style="
        width: 100vw;
        height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 8px 10px 12px 10px;
        overflow: hidden;
      ">
        <div id="trial-label" style="
          font-size: 22px;
          font-weight: 600;
          margin-bottom: 8px;
        ">
          ${trialLabel}
        </div>

        <div id="task-instructions" style="
          font-size: 18px;
          line-height: 1.35;
          margin-bottom: 8px;
          max-width: ${GRID_WIDTH + 40}px;
          text-align: center;
        ">
          Drag all ${trialImages.length} pictures into the grid.<br>
          Only one picture can occupy each square.<br>
          Tap <b>Continue</b> when all ${trialImages.length} pictures are placed.
        </div>

        <div
          id="grid-container"
          style="
            position: relative;
            width: ${GRID_WIDTH}px;
            height: ${GRID_HEIGHT + BOTTOM_AREA}px;
            border: 2px solid #444;
            background: white;
            touch-action: none;
            user-select: none;
            -webkit-user-select: none;
            overflow: hidden;
          "
        ></div>

        <div id="warning-text" style="
          margin-top: 8px;
          min-height: 26px;
          font-size: 18px;
          color: #b00020;
          font-weight: 500;
          text-align: center;
        "></div>

        <button id="continue-btn" class="task-btn" style="margin-top: 4px;">
          Continue
        </button>
      </div>
    `;

    const container = display_element.querySelector("#grid-container");
    const warningEl = display_element.querySelector("#warning-text");
    const continueBtn = display_element.querySelector("#continue-btn");

    for (let c = 1; c < GRID_COLS; c++) {
      const line = document.createElement("div");
      line.className = "grid-line-v";
      line.style.left = `${c * CELL_SIZE - 1}px`;
      line.style.top = `0px`;
      line.style.width = `2px`;
      line.style.height = `${GRID_HEIGHT}px`;
      container.appendChild(line);
    }

    for (let r = 1; r < GRID_ROWS; r++) {
      const line = document.createElement("div");
      line.className = "grid-line-h";
      line.style.top = `${r * CELL_SIZE - 1}px`;
      line.style.left = `0px`;
      line.style.height = `2px`;
      line.style.width = `${GRID_WIDTH}px`;
      container.appendChild(line);
    }

    const getRect = () => container.getBoundingClientRect();
    const startPositions = getStartPositions(trialImages.length, layout);

    imageState.forEach((item, i) => {
      const rect = getRect();
      const [left, top] = startPositions[i];
      item.centerPos = pxToCenterCoords(left, top, rect);
    });

    const imgEls = [];

    function isInsideGrid(centerPos) {
      const snapped = nearestGridCenter(centerPos[0], centerPos[1], GRID_CENTERS);
      const dx = Math.abs(centerPos[0] - snapped[0]);
      const dy = Math.abs(centerPos[1] - snapped[1]);
      return dx <= CELL_SIZE / 2 && dy <= CELL_SIZE / 2;
    }

    function getSnappedOrNull(centerPos) {
      if (!isInsideGrid(centerPos)) return null;
      return nearestGridCenter(centerPos[0], centerPos[1], GRID_CENTERS);
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
        el.style.width = `${IMG_SIZE}px`;
        el.style.height = `${IMG_SIZE}px`;

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
          offsetY: clientY - imgRect.top - imgRect.height / 2
        };
        el.classList.add("dragging");
      };

      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (el.setPointerCapture) {
          el.setPointerCapture(e.pointerId);
        }
        startDrag(e.clientX, e.clientY);
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
          imageState[index].centerPos = offsetFromQuadrant(
            currentPos[0],
            currentPos[1],
            CONFLICT_OFFSET
          );
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
    // No auto-download. Manual download at end.
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
    <div style="font-size:22px; line-height:1.55; max-width:900px; margin:auto; padding:20px;">
      <p><b>This task works best in landscape orientation.</b></p>
      <p>If you are using an iPad, please rotate it horizontally before continuing.</p>
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
    <div style="font-size:24px; line-height:1.5; padding:20px;">
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
    <div style="font-size:24px; line-height:1.5; padding:20px;">
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
      <div style="font-size:24px; line-height:1.5; padding:20px;">
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

timeline.push({
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:26px; line-height:1.55; max-width:900px; margin:auto; padding:20px;">
      Done. Thank you!<br><br>
      Tap <b>Download CSV</b> below to save your data.<br><br>
      Then tap <b>Finish</b>.
    </div>
  `,
  choices: ["Download CSV", "Finish"],
  on_finish: function(data) {
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