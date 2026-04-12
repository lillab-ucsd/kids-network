/*************************************************
 * KIDS SEMANTIC NETWORK DEMO
 * iPad-friendly version
 * - Trial title on top
 * - Warning + Continue at bottom
 * - Grid takes most of the screen
 * - Instruction pages are separate, one button each
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

/* ---------- Fixed stage dimensions ---------- */

const BASE_TASK_WIDTH = 1120;
const BASE_TASK_HEIGHT = 760;

const GRID_COLS = 10;
const GRID_ROWS = 6;
const CELL_SIZE = 96;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

const BOTTOM_AREA = 140;
const CONTAINER_HEIGHT = GRID_HEIGHT + BOTTOM_AREA;

const IMG_SIZE = 82;
const CONFLICT_OFFSET = 42;

/* ---------- Layout inside stage ---------- */

const GRID_X = 80;
const GRID_Y = 70;

const TITLE_Y = 18;
const WARNING_Y = 665;
const BUTTON_Y = 705;

/* ---------- Minimal global CSS ---------- */

(function injectGlobalStyles() {
  const style = document.createElement("style");
  style.textContent = `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      background: #f5f5f5;
      font-family: Arial, sans-serif;
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

    .task-btn {
      font-size: 20px;
      padding: 10px 22px;
      border-radius: 14px;
      border: 1px solid #888;
      background: white;
      cursor: pointer;
    }

    .task-btn:active {
      transform: scale(0.98);
    }
  `;
  document.head.appendChild(style);
})();

/* ---------- Scaling ---------- */

function getTaskScale() {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;

  const scaleX = vw / BASE_TASK_WIDTH;
  const scaleY = vh / BASE_TASK_HEIGHT;

  return Math.min(scaleX, scaleY, 1);
}

/* ---------- Utility functions ---------- */

function getStartPositions(numImages) {
  const cols = 6;
  const spacingX = GRID_WIDTH / cols;
  const spacingY = 88;

  const startX = GRID_X + spacingX / 2;
  const startY = GRID_Y + GRID_HEIGHT + 38;

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

function getFileName(path) {
  return path.split("/").pop();
}

function clamp(val, min, max) {
  return Math.max(min, Math.min(max, val));
}

function getCellCenter(col, row) {
  return {
    x: GRID_X + col * CELL_SIZE + CELL_SIZE / 2,
    y: GRID_Y + row * CELL_SIZE + CELL_SIZE / 2,
    col,
    row
  };
}

function nearestCellFromStagePoint(x, y) {
  const localX = x - GRID_X;
  const localY = y - GRID_Y;

  if (localX < 0 || localX > GRID_WIDTH || localY < 0 || localY > GRID_HEIGHT) {
    return null;
  }

  const col = Math.max(0, Math.min(GRID_COLS - 1, Math.floor(localX / CELL_SIZE)));
  const row = Math.max(0, Math.min(GRID_ROWS - 1, Math.floor(localY / CELL_SIZE)));

  return getCellCenter(col, row);
}

function sameCell(a, b) {
  return a && b && a.col === b.col && a.row === b.row;
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

    const trialLabel =
      phase === "practice"
        ? "Practice Trial"
        : `Block ${blockNumber}, Trial ${trialNumberInBlock} of ${totalTrialsInBlock}`;

    const imageState = trialImages.map((imgPath, i) => ({
      path: imgPath,
      stageX: 0,
      stageY: 0,
      index: i
    }));

    let dragState = null;
    let warningMessage = "";

    const scale = getTaskScale();

    display_element.innerHTML = `
      <div style="
        width: 100vw;
        height: 100vh;
        display: flex;
        align-items: center;
        justify-content: center;
        overflow: hidden;
        background: #f5f5f5;
      ">
        <div id="task-stage" style="
          width: ${BASE_TASK_WIDTH}px;
          height: ${BASE_TASK_HEIGHT}px;
          position: relative;
          transform: scale(${scale});
          transform-origin: center center;
          background: #f5f5f5;
        ">
          <div style="
            position: absolute;
            left: 0;
            top: ${TITLE_Y}px;
            width: ${BASE_TASK_WIDTH}px;
            font-size: 18px;
            font-weight: 700;
            text-align: center;
          ">
            ${trialLabel}
          </div>

          <div id="grid-container" style="
            position: absolute;
            left: ${GRID_X}px;
            top: ${GRID_Y}px;
            width: ${GRID_WIDTH}px;
            height: ${CONTAINER_HEIGHT}px;
            border: 3px solid #444;
            background: white;
            overflow: hidden;
            touch-action: none;
          "></div>

          <div id="warning-text" style="
            position: absolute;
            left: 0;
            top: ${WARNING_Y}px;
            width: ${BASE_TASK_WIDTH}px;
            min-height: 30px;
            font-size: 18px;
            line-height: 1.2;
            color: #b00020;
            font-weight: 500;
            text-align: center;
          "></div>

          <button id="continue-btn" class="task-btn" style="
            position: absolute;
            left: ${(BASE_TASK_WIDTH - 160) / 2}px;
            top: ${BUTTON_Y}px;
            width: 160px;
            height: 50px;
          ">
            Continue
          </button>
        </div>
      </div>
    `;

    const stage = display_element.querySelector("#task-stage");
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

    const startPositions = getStartPositions(trialImages.length);
    imageState.forEach((item, i) => {
      item.stageX = startPositions[i].x;
      item.stageY = startPositions[i].y;
    });

    const imgEls = [];

    function getStagePointFromClient(clientX, clientY) {
      const stageRect = stage.getBoundingClientRect();
      const currentScale = getTaskScale();

      return {
        x: (clientX - stageRect.left) / currentScale,
        y: (clientY - stageRect.top) / currentScale
      };
    }

    function getSnappedCellOrNull(stageX, stageY) {
      return nearestCellFromStagePoint(stageX, stageY);
    }

    function allPlacedInUniqueSquares() {
      const occupied = [];

      for (const item of imageState) {
        const snapped = getSnappedCellOrNull(item.stageX, item.stageY);
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
        el.style.left = `${item.stageX - GRID_X}px`;
        el.style.top = `${item.stageY - GRID_Y}px`;

        container.appendChild(el);
        imgEls.push(el);

        attachDragHandlers(el, index);
      });

      warningEl.textContent = warningMessage;
    }

    function updateOnePosition(index) {
      const el = imgEls[index];
      if (!el) return;
      el.style.left = `${imageState[index].stageX - GRID_X}px`;
      el.style.top = `${imageState[index].stageY - GRID_Y}px`;
    }

    function attachDragHandlers(el, index) {
      const startDrag = (clientX, clientY) => {
        const p = getStagePointFromClient(clientX, clientY);
        dragState = {
          index,
          offsetX: p.x - imageState[index].stageX,
          offsetY: p.y - imageState[index].stageY
        };
        el.classList.add("dragging");
      };

      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();
        if (el.setPointerCapture) el.setPointerCapture(e.pointerId);
        startDrag(e.clientX, e.clientY);
      });

      el.addEventListener("pointermove", (e) => {
        if (!dragState || dragState.index !== index) return;

        const p = getStagePointFromClient(e.clientX, e.clientY);

        let stageX = p.x - dragState.offsetX;
        let stageY = p.y - dragState.offsetY;

        stageX = clamp(stageX, GRID_X + IMG_SIZE / 2, GRID_X + GRID_WIDTH - IMG_SIZE / 2);
        stageY = clamp(stageY, GRID_Y + IMG_SIZE / 2, GRID_Y + CONTAINER_HEIGHT - IMG_SIZE / 2);

        imageState[index].stageX = stageX;
        imageState[index].stageY = stageY;
        updateOnePosition(index);
      });

      const finishDrag = () => {
        if (!dragState || dragState.index !== index) return;

        el.classList.remove("dragging");

        const currentX = imageState[index].stageX;
        const currentY = imageState[index].stageY;
        const snapped = getSnappedCellOrNull(currentX, currentY);

        if (!snapped) {
          warningMessage = "Each picture must end inside the grid.";
          dragState = null;
          renderImages();
          return;
        }

        let occupied = false;
        for (let i = 0; i < imageState.length; i++) {
          if (i === index) continue;
          const otherSnapped = getSnappedCellOrNull(imageState[i].stageX, imageState[i].stageY);
          if (sameCell(otherSnapped, snapped)) {
            occupied = true;
            break;
          }
        }

        if (occupied) {
          imageState[index].stageX = clamp(
            currentX + CONFLICT_OFFSET,
            GRID_X + IMG_SIZE / 2,
            GRID_X + GRID_WIDTH - IMG_SIZE / 2
          );
          imageState[index].stageY = clamp(
            currentY + CONFLICT_OFFSET,
            GRID_Y + IMG_SIZE / 2,
            GRID_Y + CONTAINER_HEIGHT - IMG_SIZE / 2
          );
          warningMessage = "That square is already occupied.";
        } else {
          imageState[index].stageX = snapped.x;
          imageState[index].stageY = snapped.y;
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
        const snapped = getSnappedCellOrNull(item.stageX, item.stageY);
        item.stageX = snapped.x;
        item.stageY = snapped.y;
      });

      const placements = imageState.map(item => {
        const snapped = getSnappedCellOrNull(item.stageX, item.stageY);
        return {
          participant,
          phase,
          block: blockNumber,
          trial: trialNumber,
          trial_in_block: trialNumberInBlock,
          image: getFileName(item.path),
          final_img_pos: `(${Math.round(item.stageX)}, ${Math.round(item.stageY)})`,
          posX: Math.round(item.stageX),
          posY: Math.round(item.stageY),
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
  on_finish: function() {}
});

const allImagesToPreload = [
  ...PRACTICE_IMAGES,
  ...MAIN_BLOCKS.flat(2)
];

const preload_trial = {
  type: jsPsychPreload,
  images: allImagesToPreload
};

const orientation_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:22px; line-height:1.5; max-width:850px; margin:auto; padding:20px;">
      <p><b>This task works best in landscape orientation.</b></p>
      <p>If you are using an iPad, please rotate it horizontally before continuing.</p>
    </div>
  `,
  choices: ["Continue"]
};

const overview_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:22px; line-height:1.5; max-width:850px; margin:auto; padding:20px;">
      <p>You will first complete <b>1 practice trial</b>.</p>
      <p>After that, you will complete <b>2 blocks</b> of trials, with <b>3 trials per block</b>.</p>
    </div>
  `,
  choices: ["Continue"]
};

const task_instruction_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:22px; line-height:1.5; max-width:850px; margin:auto; padding:20px;">
      <p>On each trial, drag all pictures into the grid and arrange them however you think is best.</p>
      <p>All pictures must end up <b>inside the grid</b>, and each square can hold only <b>one</b> picture.</p>
      <p>When you are done, tap <b>Continue</b>.</p>
    </div>
  `,
  choices: ["Continue"]
};

const practice_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:24px; line-height:1.5; padding:20px;">
      Practice Trial
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
      You will now begin the main task.
    </div>
  `,
  choices: ["Start Main Task"]
};

const timeline = [
  preload_trial,
  orientation_page,
  overview_page,
  task_instruction_page,
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
        This block has ${TRIALS_PER_BLOCK} trials.
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

const download_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:26px; line-height:1.55; max-width:900px; margin:auto; padding:20px;">
      Done. Thank you!<br><br>
      Tap below to download your CSV file.
    </div>
  `,
  choices: ["Download CSV"],
  on_finish: function() {
    const rows = [];
    jsPsychInstance.data.get().values().forEach(d => {
      if (d.placements) d.placements.forEach(row => rows.push(row));
    });
    if (rows.length > 0) {
      downloadCSV(`${DEMO_PARTICIPANT}_emotion_grid_demo.csv`, rows);
    }
  }
};

const finish_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:26px; line-height:1.55; max-width:900px; margin:auto; padding:20px;">
      Your data file should now be downloaded.<br><br>
      Tap below to finish.
    </div>
  `,
  choices: ["Finish"]
};

timeline.push(download_page, finish_page);

jsPsychInstance.run(timeline);