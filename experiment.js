/*************************************************
 * KIDS SEMANTIC NETWORK DEMO - iPad Safari friendly
 * Pixel-based snapping version
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

/* ---------- Global CSS ---------- */

(function injectGlobalStyles() {
  const style = document.createElement("style");
  style.textContent = `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f6f6f6;
      font-family: Arial, sans-serif;
    }

    .jspsych-display-element,
    .jspsych-content-wrapper,
    .jspsych-content {
      width: 100vw !important;
      height: 100vh !important;
      max-width: none !important;
      margin: 0 !important;
      padding: 0 !important;
      overflow: hidden !important;
      box-sizing: border-box !important;
    }

    .jspsych-content-wrapper,
    .jspsych-content {
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    .task-btn {
      font-size: 22px;
      padding: 12px 26px;
      border-radius: 14px;
      border: 1px solid #888;
      background: white;
      cursor: pointer;
    }

    .task-btn:active {
      transform: scale(0.98);
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

    .grid-line-v,
    .grid-line-h {
      position: absolute;
      background: #cfcfcf;
      pointer-events: none;
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- Layout ---------- */

function getLayoutSizes() {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

  const sidePanelWidth = Math.max(210, Math.min(290, vw * 0.24));
  const gap = Math.max(18, Math.min(28, vw * 0.02));
  const rightAreaWidth = vw - sidePanelWidth - gap * 3;

  const maxCellFromWidth = Math.floor(rightAreaWidth / GRID_COLS);
  const maxCellFromHeight = Math.floor((vh * 0.62) / GRID_ROWS);

  const cellSize = Math.max(48, Math.min(maxCellFromWidth, maxCellFromHeight, 92));

  const gridWidth = GRID_COLS * cellSize;
  const gridHeight = GRID_ROWS * cellSize;

  const bottomArea = Math.max(120, Math.min(vh * 0.18, 170));
  const imgSize = Math.max(42, Math.min(Math.round(cellSize * 0.8), 72));
  const conflictOffset = Math.max(12, Math.round(cellSize * 0.22));

  return {
    VIEW_W: vw,
    VIEW_H: vh,
    SIDE_W: sidePanelWidth,
    GAP: gap,
    CELL_SIZE: cellSize,
    GRID_WIDTH: gridWidth,
    GRID_HEIGHT: gridHeight,
    BOTTOM_AREA: bottomArea,
    IMG_SIZE: imgSize,
    CONFLICT_OFFSET: conflictOffset
  };
}

function getStartPositions(numImages, layout) {
  const { GRID_WIDTH, GRID_HEIGHT, BOTTOM_AREA } = layout;
  const cols = 6;
  const rows = Math.ceil(numImages / cols);

  const spacingX = GRID_WIDTH / cols;
  const spacingY = Math.max(42, Math.min(62, BOTTOM_AREA / Math.max(rows, 1)));

  const startX = spacingX / 2;
  const startY = GRID_HEIGHT + 18;

  const positions = [];

  for (let i = 0; i < numImages; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);

    positions.push({
      x: startX + col * spacingX,
      y: startY + row * spacingY
    });
  }

  return positions;
}

function getCellCenterPx(col, row, cellSize) {
  return {
    x: col * cellSize + cellSize / 2,
    y: row * cellSize + cellSize / 2
  };
}

function nearestCellCenterPx(x, y, cellSize) {
  const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(x / cellSize)));
  const row = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(y / cellSize)));
  return {
    ...getCellCenterPx(col, row, cellSize),
    col,
    row
  };
}

function sameCell(a, b) {
  return a.col === b.col && a.row === b.row;
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getFileName(path) {
  return path.split("/").pop();
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
    const trialImages = trial.images;
    const blockNumber = trial.block_number ?? null;
    const trialNumberInBlock = trial.trial_number_in_block ?? trialNumber;
    const totalTrialsInBlock = trial.total_trials_in_block ?? trial.total_trials;

    const layout = getLayoutSizes();
    const {
      VIEW_W, VIEW_H, SIDE_W, GAP,
      CELL_SIZE, GRID_WIDTH, GRID_HEIGHT,
      BOTTOM_AREA, IMG_SIZE, CONFLICT_OFFSET
    } = layout;

    const containerHeight = GRID_HEIGHT + BOTTOM_AREA;

    const imageState = trialImages.map((imgPath, i) => ({
      path: imgPath,
      px: { x: 0, y: 0 },
      index: i
    }));

    let dragState = null;
    let warningMessage = "";

    const trialLabel =
      phase === "practice"
        ? "Practice Trial"
        : `Block ${blockNumber}, Trial ${trialNumberInBlock} of ${totalTrialsInBlock}`;

    display_element.innerHTML = `
      <div style="
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        box-sizing: border-box;
        padding: 14px 16px;
        gap: ${GAP}px;
        overflow: hidden;
      ">
        <div style="
          width: ${SIDE_W}px;
          max-width: ${SIDE_W}px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 12px;
          flex-shrink: 0;
        ">
          <div style="
            font-size: 22px;
            font-weight: 700;
            padding: 14px 18px;
            border: 2px solid #d8d8d8;
            background: white;
            box-sizing: border-box;
            width: 100%;
          ">
            ${trialLabel}
          </div>

          <div style="
            font-size: 18px;
            line-height: 1.35;
            padding: 16px 18px;
            border: 2px solid #d8d8d8;
            background: white;
            box-sizing: border-box;
            width: 100%;
            text-align: center;
          ">
            Drag all ${trialImages.length} pictures into the grid.<br><br>
            Only one picture can occupy each square.<br><br>
            Tap <b>Continue</b> when all ${trialImages.length} pictures are placed.
          </div>
        </div>

        <div style="
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex: 1;
          min-width: 0;
        ">
          <div
            id="grid-container"
            style="
              position: relative;
              width: ${GRID_WIDTH}px;
              height: ${containerHeight}px;
              border: 3px solid #444;
              background: white;
              touch-action: none;
              user-select: none;
              -webkit-user-select: none;
              overflow: hidden;
            "
          ></div>

          <div id="warning-text" style="
            min-height: 28px;
            font-size: 18px;
            color: #b00020;
            font-weight: 500;
            text-align: center;
          "></div>

          <button id="continue-btn" class="task-btn">Continue</button>
        </div>
      </div>
    `;

    const container = display_element.querySelector("#grid-container");
    const warningEl = display_element.querySelector("#warning-text");
    const continueBtn = display_element.querySelector("#continue-btn");

    /* draw grid lines */
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

    /* initialize positions */
    const startPositions = getStartPositions(trialImages.length, layout);
    imageState.forEach((item, i) => {
      item.px = { ...startPositions[i] };
    });

    const imgEls = [];

    function isInsideGrid(px) {
      return (
        px.x >= 0 &&
        px.x <= GRID_WIDTH &&
        px.y >= 0 &&
        px.y <= GRID_HEIGHT
      );
    }

    function getSnappedCellOrNull(px) {
      if (!isInsideGrid(px)) return null;
      return nearestCellCenterPx(px.x, px.y, CELL_SIZE);
    }

    function allPlacedInUniqueSquares() {
      const occupied = [];

      for (const item of imageState) {
        const snapped = getSnappedCellOrNull(item.px);
        if (!snapped) return false;
        occupied.push(`${snapped.col},${snapped.row}`);
      }

      return new Set(occupied).size === imageState.length;
    }

    function renderImages() {
      imgEls.forEach(el => el.remove());
      imgEls.length = 0;

      imageState.forEach((item, index) => {
        const el = document.createElement("img");
        el.className = "stim-img";
        el.src = item.path;
        el.draggable = false;
        el.style.width = `${IMG_SIZE}px`;
        el.style.height = `${IMG_SIZE}px`;
        el.style.left = `${item.px.x}px`;
        el.style.top = `${item.px.y}px`;

        container.appendChild(el);
        imgEls.push(el);

        attachDragHandlers(el, index);
      });

      warningEl.textContent = warningMessage;
    }

    function updateOnePosition(index) {
      const el = imgEls[index];
      if (!el) return;
      el.style.left = `${imageState[index].px.x}px`;
      el.style.top = `${imageState[index].px.y}px`;
    }

    function attachDragHandlers(el, index) {
      const startDrag = (clientX, clientY) => {
        const rect = container.getBoundingClientRect();
        const centerX = imageState[index].px.x;
        const centerY = imageState[index].px.y;

        dragState = {
          index,
          offsetX: clientX - rect.left - centerX,
          offsetY: clientY - rect.top - centerY
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

        const rect = container.getBoundingClientRect();
        let x = e.clientX - rect.left - dragState.offsetX;
        let y = e.clientY - rect.top - dragState.offsetY;

        x = clamp(x, IMG_SIZE / 2, rect.width - IMG_SIZE / 2);
        y = clamp(y, IMG_SIZE / 2, rect.height - IMG_SIZE / 2);

        imageState[index].px = { x, y };
        updateOnePosition(index);
      });

      const finishDrag = () => {
        if (!dragState || dragState.index !== index) return;

        el.classList.remove("dragging");

        const currentPx = imageState[index].px;
        const snapped = getSnappedCellOrNull(currentPx);

        if (!snapped) {
          warningMessage = "Each picture must end inside the grid.";
          dragState = null;
          renderImages();
          return;
        }

        let occupied = false;
        for (let i = 0; i < imageState.length; i++) {
          if (i === index) continue;
          const otherSnapped = getSnappedCellOrNull(imageState[i].px);
          if (otherSnapped && sameCell(otherSnapped, snapped)) {
            occupied = true;
            break;
          }
        }

        if (occupied) {
          imageState[index].px = {
            x: clamp(currentPx.x + CONFLICT_OFFSET, IMG_SIZE / 2, GRID_WIDTH - IMG_SIZE / 2),
            y: clamp(currentPx.y + CONFLICT_OFFSET, IMG_SIZE / 2, containerHeight - IMG_SIZE / 2)
          };
          warningMessage = "That square is already occupied.";
        } else {
          imageState[index].px = { x: snapped.x, y: snapped.y };
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
        const snapped = getSnappedCellOrNull(item.px);
        item.px = { x: snapped.x, y: snapped.y };
      });

      const placements = imageState.map(item => {
        const snapped = getSnappedCellOrNull(item.px);
        return {
          participant,
          phase,
          block: blockNumber,
          trial: trialNumber,
          trial_in_block: trialNumberInBlock,
          image: getFileName(item.path),
          final_img_pos: `(${Math.round(item.px.x)}, ${Math.round(item.px.y)})`,
          posX: Math.round(item.px.x),
          posY: Math.round(item.px.y),
          grid_col: snapped.col + 1,
          grid_row: snapped.row + 1
        };
      });

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
    // manual download at end
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