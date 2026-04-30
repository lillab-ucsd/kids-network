const DEMO_PARTICIPANT = "demo";

const MINI_PRACTICE_IMAGES = [
  "stimuli/food/pizza_1.jpg",
  "stimuli/food/pizza_2.jpg",
  "stimuli/food/french_fries_1.jpg",
  "stimuli/food/french_fries_2.jpg",
  "stimuli/artifact/snowman_1.jpg",
];

const NUM_BLOCKS = 2;
const TRIALS_PER_BLOCK = 3;
const TOTAL_MAIN_TRIALS = NUM_BLOCKS * TRIALS_PER_BLOCK;


/* ---------- category structure ---------- */

const CATEGORIES = {
  animals: [
    ["stimuli/animals/peacock_1.jpg",
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
      "stimuli/animals/wolf_1.jpg"],
    ["stimuli/animals/peacock_2.jpg",
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
      "stimuli/animals/wolf_2.jpg"]
  ],
  emotions: [
    ["stimuli/emotions/happy_1.jpg",
      "stimuli/emotions/sad_1.jpg",
      "stimuli/emotions/angry_1.jpg",
      "stimuli/emotions/fearful_1.jpg",
      "stimuli/emotions/disgust_1.jpg",
      "stimuli/emotions/surprise_1.jpg",
      "stimuli/emotions/happy_2.jpg",
      "stimuli/emotions/sad_2.jpg",
      "stimuli/emotions/angry_2.jpg",
      "stimuli/emotions/fearful_2.jpg",
      "stimuli/emotions/disgust_2.jpg",
      "stimuli/emotions/surprise_2.jpg"],
    ["stimuli/emotions/happy_1.jpg",
      "stimuli/emotions/sad_1.jpg",
      "stimuli/emotions/angry_1.jpg",
      "stimuli/emotions/fearful_1.jpg",
      "stimuli/emotions/disgust_1.jpg",
      "stimuli/emotions/surprise_1.jpg",
      "stimuli/emotions/happy_2.jpg",
      "stimuli/emotions/sad_2.jpg",
      "stimuli/emotions/angry_2.jpg",
      "stimuli/emotions/fearful_2.jpg",
      "stimuli/emotions/disgust_2.jpg",
      "stimuli/emotions/surprise_2.jpg"]
  ],
  plants: [
    ["stimuli/plants/broccoli_1.jpg",
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
      "stimuli/plants/peanut_1.jpg"],
    ["stimuli/plants/broccoli_2.jpg",
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
      "stimuli/plants/peanut_2.jpg"]
  ]
};

const SET_CONDITIONS = [
  { animal: 0, plant: 0, artifact: 0 },
  { animal: 0, plant: 0, artifact: 1 },
  { animal: 0, plant: 1, artifact: 0 },
  { animal: 0, plant: 1, artifact: 1 },
  { animal: 1, plant: 0, artifact: 0 },
  { animal: 1, plant: 0, artifact: 1 },
  { animal: 1, plant: 1, artifact: 0 },
  { animal: 1, plant: 1, artifact: 1 }
];

/* ---------- fixed stage ---------- */

const BASE_TASK_WIDTH = 1160;
const BASE_TASK_HEIGHT = 760;

const GRID_COLS = 10;
const GRID_ROWS = 6;
const CELL_SIZE = 104;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

const BOTTOM_AREA = 0;
const CONTAINER_HEIGHT = GRID_HEIGHT + BOTTOM_AREA;

const SMALL_SIZE = 90;
const FOCAL_SCALE = 2;
const DRAG_SCALE = 1.8;
const CONFLICT_OFFSET = 42;

const GRID_X = (BASE_TASK_WIDTH - GRID_WIDTH) / 2;
const GRID_Y = 52;

const WARNING_Y = 690;
const TOPBAR_Y = 10;


/* ---------- CSS ---------- */

(function injectStyles() {
  const style = document.createElement("style");
  style.textContent = `
    html, body {
      margin: 0;
      padding: 0;
      width: 100%;
      height: 100%;
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
      transition: width 120ms ease, height 120ms ease;
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

function getTaskScale() {
  const vw = window.visualViewport ? window.visualViewport.width : window.innerWidth;
  const vh = window.visualViewport ? window.visualViewport.height : window.innerHeight;
  return Math.min(vw / BASE_TASK_WIDTH, vh / BASE_TASK_HEIGHT, 1);
}

function getSingleStartPosition() {
  return {
    x: GRID_X + GRID_WIDTH / 2,
    y: GRID_Y + GRID_HEIGHT / 2
  };
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

function makePreviewPage(images) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        height:85vh;
      ">
        <div style="
          display:grid;
          grid-template-columns: repeat(6, 1fr);
          gap:24px;
          max-width:1000px;
          margin-bottom:40px;
        ">
          ${images.map(img => `
            <img src="${img}" style="
              width:130px;
              height:130px;
              object-fit:contain;
            ">
          `).join("")}
        </div>

        <button id="preview-start-btn" style="
          font-size:26px;
          padding:18px 50px;
          border-radius:16px;
          background:#4CAF50;
          color:white;
          border:none;
          cursor:pointer;
        ">
          Start
        </button>
      </div>
    `,
    choices: [],  // disable default jsPsych button
    on_load: function() {
      document.getElementById("preview-start-btn")
        .addEventListener("click", function() {
          jsPsychInstance.finishTrial();
        });
    }
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
      headers.map(h => `"${String(row[h] ?? "").replace(/"/g, '""')}"`).join(",")
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

/* ---------- plugin ---------- */

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
    index: i,
    introduced: false,
    hasBeenMoved: false
  }));

  let dragState = null;
  let warningMessage = "";
  let currentFocusIdx = 0;
  let allImagesShown = false;

  const moveLog = [];

function logMove(eventType, index, extra = {}) {
  const item = imageState[index];
  const snapped = getSnappedCellOrNull(item.stageX, item.stageY);

  moveLog.push({
    image_name: getFileName(imageState[index].path),
    trial: trialNumber,
    block: blockNumber,
    phase,
    grid_col: snapped.col + 1,
    grid_row: snapped.row + 1,
    posX: Math.round(snapped.x),
    posY: Math.round(snapped.y),
    timestamp: performance.now()
  });
}
  const scale = getTaskScale();
  const jsPsych = this.jsPsych;

    imageState[0].introduced = true;
    const firstPos = getSingleStartPosition();
    imageState[0].stageX = firstPos.x;
    imageState[0].stageY = firstPos.y;

    display_element.innerHTML = `
      <div style="
        width: 100vw;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        background: #f5f5f5;
        overflow: hidden;
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
            top: ${TOPBAR_Y}px;
            left: 0;
            width: ${BASE_TASK_WIDTH}px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            z-index: 5;
          ">
            <div style="
              font-size: 18px;
              font-weight: 700;
              line-height: 1;
            ">
              ${trialLabel}
            </div>

            <button id="continue-btn" style="
              width: 140px;
              height: 42px;
              font-size: 18px;
              border-radius: 12px;
              border: 1px solid #888;
              background: white;
              cursor: pointer;
              display: none;
            ">
              Continue
            </button>
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
            z-index: 1;
          "></div>

          <div id="warning-text" style="
            position: absolute;
            left: 0;
            top: ${WARNING_Y}px;
            width: ${BASE_TASK_WIDTH}px;
            min-height: 26px;
            text-align: center;
            font-size: 16px;
            line-height: 1.2;
            color: #b00020;
            font-weight: 500;
            z-index: 4;
          "></div>
        </div>
      </div>
    `;

    const stage = display_element.querySelector("#task-stage");
    const container = display_element.querySelector("#grid-container");
    const warningEl = display_element.querySelector("#warning-text");
    const continueBtn = display_element.querySelector("#continue-btn");
    container.style.touchAction = "none";

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

    const imgEls = [];

    function getStagePointFromClient(clientX, clientY) {
      const rect = stage.getBoundingClientRect();
      const currentScale = getTaskScale();
      return {
        x: (clientX - rect.left) / currentScale,
        y: (clientY - rect.top) / currentScale
      };
    }

    function getSnappedCellOrNull(stageX, stageY) {
      return nearestCellFromStagePoint(stageX, stageY);
    }

    function getCurrentFocusPath() {
      return imageState[currentFocusIdx]?.path;
    }

    function getDisplaySize(item) {
      const isDragging = dragState && dragState.index === item.index;
      const isFocal = !allImagesShown && item.path === getCurrentFocusPath();

      if (isDragging) return Math.round(SMALL_SIZE * DRAG_SCALE);
      if (isFocal) return Math.round(SMALL_SIZE * FOCAL_SCALE);
      return SMALL_SIZE;
    }

    function allIntroducedPlacedInUniqueSquares() {
      const occupied = [];

      for (const item of imageState) {
        if (!item.introduced) continue;
        const snapped = getSnappedCellOrNull(item.stageX, item.stageY);
        if (!snapped) return false;
        occupied.push(`${snapped.col},${snapped.row}`);
      }

      return new Set(occupied).size === occupied.length;
    }

    function finishWholeTrial() {
      const placements = imageState
        .filter(item => item.introduced)
        .map(item => {
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
            grid_row: snapped.row + 1,
            introduction_order: item.index + 1
          };
        });


      display_element.innerHTML = "";

      jsPsych.finishTrial({
        participant,
        phase,
        image_order: trial.image_order,
        block: blockNumber,
        trial: trialNumber,
        trial_in_block: trialNumberInBlock,
        placements,
        move_log: moveLog
      });
    }

    function introduceNextImage() {
      if (currentFocusIdx >= imageState.length - 1) return false;

      currentFocusIdx += 1;
      imageState[currentFocusIdx].introduced = true;

      const pos = getSingleStartPosition();
      imageState[currentFocusIdx].stageX = pos.x;
      imageState[currentFocusIdx].stageY = pos.y;

      return true;
    }

    function maybeAdvanceAfterPlacement(index) {
      if (index !== currentFocusIdx) return;

      if (!imageState[index].hasBeenMoved) return;

      const currentItem = imageState[currentFocusIdx];
      const snapped = getSnappedCellOrNull(currentItem.stageX, currentItem.stageY);
      if (!snapped) return;

      currentItem.stageX = snapped.x;
      currentItem.stageY = snapped.y;

      if (!allIntroducedPlacedInUniqueSquares()) return;

      const hasNext = introduceNextImage();
      if (hasNext) {
        warningMessage = "";
        renderImages();
      } else {
        allImagesShown = true;
        warningMessage = "You can still adjust the pictures. Tap Continue when you are finished.";
        continueBtn.style.display = "inline-block";

        // make sure the last image is fully snapped and no longer treated as focal
        currentItem.stageX = snapped.x;
        currentItem.stageY = snapped.y;

        renderImages();
      }
    }

    function renderImages() {
      imgEls.forEach(el => el.remove());
      imgEls.length = 0;

      imageState.forEach((item, index) => {
        if (!item.introduced) return;

        const el = document.createElement("img");
        el.className = "stim-img";
        el.src = item.path;
        el.draggable = false;

        const size = getDisplaySize(item);
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.style.left = `${item.stageX - GRID_X}px`;
        el.style.top = `${item.stageY - GRID_Y}px`;

        container.appendChild(el);
        imgEls.push(el);
        attachDragHandlers(el, index);
      });

      warningEl.textContent = warningMessage;
    }

    function attachDragHandlers(el, index) {

      el.addEventListener("pointerdown", (e) => {
        e.preventDefault();

        const p = getStagePointFromClient(e.clientX, e.clientY);

        dragState = {
          index,
          offsetX: p.x - imageState[index].stageX,
          offsetY: p.y - imageState[index].stageY
        };

        if (el.setPointerCapture) {
          el.setPointerCapture(e.pointerId);
        }
      });

    }

    stage.addEventListener("pointermove", (e) => {
      if (!dragState) return;

      const index = dragState.index;
      const p = getStagePointFromClient(e.clientX, e.clientY);

      let stageX = p.x - dragState.offsetX;
      let stageY = p.y - dragState.offsetY;

      const currentSize = SMALL_SIZE;

      stageX = clamp(stageX, GRID_X + currentSize / 2, GRID_X + GRID_WIDTH - currentSize / 2);
      stageY = clamp(stageY, GRID_Y + currentSize / 2, GRID_Y + CONTAINER_HEIGHT - currentSize / 2);

      imageState[index].stageX = stageX;
      imageState[index].stageY = stageY;

      renderImages();
    });

    stage.addEventListener("pointerup", (e) => {
      if (!dragState) return;

      const index = dragState.index;
      dragState = null;

      const snapped = getSnappedCellOrNull(
        imageState[index].stageX,
        imageState[index].stageY
      );

      if (!snapped) {
        renderImages();
        return;
      }

      imageState[index].stageX = snapped.x;
      imageState[index].stageY = snapped.y;

      logMove("placement", index);

      imageState[index].hasBeenMoved = true;

      maybeAdvanceAfterPlacement(index);   // 🔥 restore this

      renderImages();
    });

    continueBtn.addEventListener("click", () => {
      if (!allImagesShown) return;

      if (!allIntroducedPlacedInUniqueSquares()) {
        warningMessage = "Make sure all pictures are in different grid squares before continuing.";
        renderImages();
        return;
      }

      finishWholeTrial();
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
  display_element: 'jspsych-target',
  on_finish: function() {}
});

const categoryNames = Object.keys(CATEGORIES);
const randomizedCategoryOrder =
  jsPsychInstance.randomization.shuffle(categoryNames);

/* ---------- counterbalance sets ---------- */

const categorySetAssignment = {};

randomizedCategoryOrder.forEach(category => {
  const firstSetIndex = Math.random() < 0.5 ? 0 : 1;

  categorySetAssignment[category] = {
    block1: firstSetIndex,
    block2: 1 - firstSetIndex
  };
});

jsPsychInstance.data.addProperties({
  category_order: randomizedCategoryOrder.join(","),
  set_assignment: JSON.stringify(categorySetAssignment)
});

/* ---------- build MAIN_BLOCKS dynamically ---------- */

const MAIN_BLOCKS = [[], []];

randomizedCategoryOrder.forEach(category => {

  MAIN_BLOCKS[0].push(
    CATEGORIES[category][categorySetAssignment[category].block1]
  );

  MAIN_BLOCKS[1].push(
    CATEGORIES[category][categorySetAssignment[category].block2]
  );

});


const allImagesToPreload = [
  ...MAIN_BLOCKS.flat(2)
];

const participant_info_trial = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="font-size:26px; margin-bottom:20px;">
      Enter Participant Information
    </div>

    <div style="margin-bottom:15px;">
      Participant ID:<br>
      <input id="participant-input"
             type="text"
             style="font-size:22px; padding:8px; width:200px;">
    </div>

    <div>
      Version (1–8):<br>
      <input id="version-input"
             type="number"
             min="1"
             max="8"
             style="font-size:22px; padding:8px; width:80px;">
    </div>
  `,
  choices: [],
  on_load: function() {

    const btn = document.createElement("button");
    btn.textContent = "Continue";
    btn.style.fontSize = "22px";
    btn.style.padding = "12px 30px";
    btn.style.marginTop = "20px";
    btn.style.borderRadius = "12px";
    btn.style.cursor = "pointer";

    document.querySelector(".jspsych-content").appendChild(btn);

    btn.addEventListener("click", function() {

      const pid = document.getElementById("participant-input").value.trim();
      const version = parseInt(document.getElementById("version-input").value);

      if (!pid) {
        alert("Please enter participant ID.");
        return;
      }

      if (!version || version < 1 || version > 8) {
        alert("Version must be between 1 and 8.");
        return;
      }

      window.PARTICIPANT_ID = pid;
      window.VERSION = version;

      jsPsychInstance.data.addProperties({
        participant_id: pid,
        version: version
      });

      jsPsychInstance.finishTrial();
    });
  }
};

const preload_trial = {
  type: jsPsychPreload,
  images: allImagesToPreload
};

const practice_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="
      display:flex;
      justify-content:center;
      align-items:center;
      height:60vh;
    ">
      <button id="practice-start-btn" style="
        font-size:28px;
        padding:20px 50px;
        border-radius:18px;
        cursor:pointer;
        background:#4CAF50;
        color:white;
        border:none;
      ">
        Start Practice
      </button>
    </div>
  `,
  choices: [],  // disable default jsPsych button
  on_load: function() {
    document.getElementById("practice-start-btn")
      .addEventListener("click", function() {
        jsPsychInstance.finishTrial();
      });
  }
};

const mini_practice_trial = {
  type: EmotionGridPlugin,
  participant: DEMO_PARTICIPANT,
  phase: "practice",
  trial_number: -1,  // distinguish from real practice
  total_trials: 1,
  images: MINI_PRACTICE_IMAGES
};


const main_intro = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      padding:120px 20px;
      text-align:center;
    ">
      <button id="main-start-btn" style="
        font-size:26px;
        padding:18px 40px;
        border-radius:16px;
        cursor:pointer;
        background:#4CAF50;
        color:white;
        border:none;
      ">
        Start Main Task
      </button>

    </div>
  `,
  choices: [],
  on_load: function() {
    document.getElementById("main-start-btn")
      .addEventListener("click", function() {
        jsPsychInstance.finishTrial();
      });
  }
};

const attention_star_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="
      display:flex;
      flex-direction:column;
      align-items:center;
      justify-content:center;
      padding:80px 20px 40px 20px;
      text-align:center;
    ">
      <img src="stimuli/star.png" style="
        width:160px;
        height:160px;
        animation: spinScale 1.5s ease-in-out infinite;
        margin-bottom:30px;
      ">
      <div style="font-size:28px; font-weight:600;">
        Great job!
      </div>
    </div>

    <style>
      @keyframes spinScale {
        0%   { transform: scale(1) rotate(0deg); }
        50%  { transform: scale(1.4) rotate(180deg); }
        100% { transform: scale(1) rotate(360deg); }
      }
    </style>
  `,
  choices: ["Next"]
};

function makeCelebrationPage(message = "Great job!") {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="
        display:flex;
        flex-direction:column;
        align-items:center;
        justify-content:center;
        padding:80px 20px 40px 20px;
        text-align:center;
      ">
        <img src="stimuli/fireworks.gif" style="
          width:300px;
          height:200px;
          animation: spinScale 1.5s ease-in-out infinite;
          margin-bottom:30px;
        ">
        <div style="font-size:28px; font-weight:600;">
          ${message}
        </div>
      </div>


    `,
    choices: ["Next"]
  };
}


const timeline = [
  participant_info_trial,
  preload_trial,
  practice_intro,
  makePreviewPage(MINI_PRACTICE_IMAGES),
  mini_practice_trial,
  makeCelebrationPage(),
  main_intro
];

let globalTrialNumber = 1;

for (let b = 0; b < NUM_BLOCKS; b++) {

  timeline.push({
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div style="font-size:24px; padding:20px;">
        Block ${b + 1} of ${NUM_BLOCKS}
      </div>
    `,
    choices: ["Begin Block"]
  });

  for (let t = 0; t < TRIALS_PER_BLOCK; t++) {

    const shuffledImages =
      jsPsychInstance.randomization.shuffle([...MAIN_BLOCKS[b][t]]);
    
      timeline.push(makePreviewPage(shuffledImages));

      timeline.push({
      type: EmotionGridPlugin,
      participant: DEMO_PARTICIPANT,
      phase: "main",
      block_number: b + 1,
      trial_number: globalTrialNumber,
      trial_number_in_block: t + 1,
      total_trials: TOTAL_MAIN_TRIALS,
      total_trials_in_block: TRIALS_PER_BLOCK,
      images: shuffledImages,
      image_order: shuffledImages
    });

    globalTrialNumber++;

    timeline.push(attention_star_page);
  }
}


const save_data = {
  type: jsPsychPipe,
  action: "save",
  experiment_id: "9j5Y0g2B4xWA",
  filename: () => `${window.PARTICIPANT_ID}.csv`,
  data_string: () => jsPsychInstance.data.get().csv()
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

timeline.push(save_data, finish_page);

jsPsychInstance.run(timeline);