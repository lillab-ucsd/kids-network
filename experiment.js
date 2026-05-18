const DEMO_PARTICIPANT = "demo";

const MINI_PRACTICE_IMAGES = [
  "stimuli/food/pizza_1.jpg",
  "stimuli/food/hamburger.jpg",
  "stimuli/food/french_fries_1.jpg",
  "stimuli/food/ice_cream_1.jpg",
  "stimuli/food/cookie.jpg",
];

const MINI_PRACTICE_IMAGES_2 = [
  "stimuli/food/toast.jpg",
  "stimuli/food/bread.jpg",
  "stimuli/food/croissant.jpg",
  "stimuli/food/chocolate_2.jpg",
  "stimuli/food/candy.jpg"
];

const NUM_BLOCKS = 3;
const TRIALS_PER_BLOCK = 2;
const TOTAL_MAIN_TRIALS = NUM_BLOCKS * TRIALS_PER_BLOCK;

let MAIN_BLOCKS = [];
let randomizedCategoryOrder = [];
let useReverseSetOrder = false;

const sorting_correct_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      height:100vh;
      text-align:center;
    ">

      <div style="
        font-size:36px;
        font-weight:700;
        margin-bottom:40px;
      ">
        Put similar pictures together!
      </div>

      <div style="position:relative; width:80vw; max-width:1000px;">
        <img src="stimuli/examples/correct_example.png"
             style="
               width:100%;
               max-height:65vh;
               object-fit:contain;
               border:8px solid #4CAF50;
             ">
        <div style="
          position:absolute;
          top:-30px;
          right:-30px;
          font-size:90px;
          color:#4CAF50;
          font-weight:bold;
        ">✓</div>
      </div>

      <button id="correct-next-btn" style="
        margin-top:40px;
        font-size:24px;
        padding:14px 40px;
        border-radius:16px;
        background:#4CAF50;
        color:white;
        border:none;
        cursor:pointer;
      ">
        Next
      </button>

    </div>
  `,
  choices: [],
  on_load: function() {
    document.getElementById("correct-next-btn")
      .addEventListener("click", function() {
        jsPsychInstance.finishTrial();
      });
  }
};

const sorting_wrong_page = {
  type: jsPsychHtmlButtonResponse,
  stimulus: `
    <div style="
      display:flex;
      flex-direction:column;
      justify-content:center;
      align-items:center;
      height:100vh;
      text-align:center;
    ">

      <div style="
        font-size:36px;
        font-weight:700;
        margin-bottom:40px;
      ">
        Not like this
      </div>

      <div style="position:relative; width:80vw; max-width:1000px;">
        <img src="stimuli/examples/wrong_example.png"
             style="
               width:100%;
               max-height:65vh;
               object-fit:contain;
               border:8px solid #d32f2f;
             ">
        <div style="
          position:absolute;
          top:-30px;
          right:-30px;
          font-size:90px;
          color:#d32f2f;
          font-weight:bold;
        ">✗</div>
      </div>

      <button id="wrong-start-btn" style="
        margin-top:40px;
        font-size:24px;
        padding:14px 40px;
        border-radius:16px;
        background:#4CAF50;
        color:white;
        border:none;
        cursor:pointer;
      ">
        Start Practice
      </button>

    </div>
  `,
  choices: [],
  on_load: function() {
    document.getElementById("wrong-start-btn")
      .addEventListener("click", function() {
        jsPsychInstance.finishTrial();
      });
  }
};

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
    ["stimuli/emotions/happy_3.jpg",
      "stimuli/emotions/sad_3.jpg",
      "stimuli/emotions/angry_3.jpg",
      "stimuli/emotions/fearful_3.jpg",
      "stimuli/emotions/disgust_3.jpg",
      "stimuli/emotions/surprise_3.jpg",
      "stimuli/emotions/happy_4.jpg",
      "stimuli/emotions/sad_4.jpg",
      "stimuli/emotions/angry_4.jpg",
      "stimuli/emotions/fearful_4.jpg",
      "stimuli/emotions/disgust_4.jpg",
      "stimuli/emotions/surprise_4.jpg"]
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
          grid-template-columns: repeat(auto-fit, minmax(130px, 1fr));
          justify-content: center;
          gap:24px;
          max-width:1000px;
          margin:0 auto 40px auto;
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
      headers.map(h => `"${String(row[h] !== undefined ? row[h] : "").replace(/"/g, '""')}"`)
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

    let highestZ = 10;
    const jsPsych = this.jsPsych;
    const participant = trial.participant;
    const phase = trial.phase;
    const trialNumber = trial.trial_number;
    const blockNumber = trial.block_number || null;

    const trialImages = trial.images || [];
    if (!trialImages.length) {
      console.error("No images passed to trial.");
      return;
    }

    /* ---------- State ---------- */

    const imageState = trialImages.map((path, i) => ({
      path,
      index: i,
      stageX: 0,
      stageY: 0,
      introduced: false,
      hasBeenMoved: false
    }));

    let dragState = null;

    let currentFocusIdx = 0;
    let allImagesShown = false;
    let warningMessage = "";

    const moveLog = [];

    /* ---------- Layout ---------- */

    const BASE_WIDTH = 1160;
    const BASE_HEIGHT = 760;

    const GRID_COLS = 10;
    const GRID_ROWS = 6;
    const CELL_SIZE = 104;

    const GRID_WIDTH = GRID_COLS * CELL_SIZE;
    const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

    const GRID_X = (BASE_WIDTH - GRID_WIDTH) / 2;
    const GRID_Y = 80;

    const SMALL_SIZE = 90;
    const FOCAL_SCALE = 2;
    const DRAG_SCALE = 1.6;

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

    function getSnappedCellOrNull(stageX, stageY) {

  // If center is outside grid, don't snap
      if (
        stageX < 0 || stageX > GRID_WIDTH ||
        stageY < 0 || stageY > GRID_HEIGHT
      ) {
        return null;
      }

      const col = Math.floor(stageX / CELL_SIZE);
      const row = Math.floor(stageY / CELL_SIZE);

      return {
        x: col * CELL_SIZE + CELL_SIZE / 2,
        y: row * CELL_SIZE + CELL_SIZE / 2,
        col,
        row
      };
    }

    function getCenterPosition() {
      return {
        x: GRID_WIDTH / 2,
        y: GRID_HEIGHT / 2
      };
    }

    function getDisplaySize(item) {
      if (dragState && dragState.index === item.index)
        return SMALL_SIZE * DRAG_SCALE;

      if (!allImagesShown && item.index === currentFocusIdx)
        return SMALL_SIZE * FOCAL_SCALE;

      return SMALL_SIZE;
    }

    /* ---------- Build HTML ---------- */

/* ---------- Build HTML ---------- */

    display_element.innerHTML = `
      <div style="display:flex;justify-content:center;">
        <div id="stage" style="
          width:${BASE_WIDTH}px;
          height:${BASE_HEIGHT}px;
          position:relative;
          background:#f5f5f5;
        ">
          <div id="grid" style="
            position:absolute;
            left:${GRID_X}px;
            top:${GRID_Y}px;
            width:${GRID_WIDTH}px;
            height:${GRID_HEIGHT}px;
            border:3px solid #444;
            background:white;
          "></div>

          <div id="warning" style="
            position:absolute;
            top:${GRID_Y + GRID_HEIGHT + 20}px;
            left:50%;
            transform:translateX(-50%);
            text-align:center;
            color:#b00020;
            font-weight:600;
            font-size:20px;
          "></div>

          <button id="continue-btn" style="
            position:absolute;
            top:${GRID_Y - 60}px;
            left:50%;
            transform:translateX(-50%);
            padding:12px 28px;
            font-size:18px;
            display:none;
          ">
            Continue
          </button>
        </div>
      </div>
    `;

    const stage = display_element.querySelector("#stage");
    const grid = display_element.querySelector("#grid");
    const warningEl = display_element.querySelector("#warning");
    const continueBtn = display_element.querySelector("#continue-btn");

    /* ---------- Draw Grid Lines ---------- */

    for (let c = 1; c < GRID_COLS; c++) {
      const line = document.createElement("div");
      line.style.position = "absolute";
      line.style.left = `${c * CELL_SIZE}px`;
      line.style.top = "0";
      line.style.width = "1px";
      line.style.height = `${GRID_HEIGHT}px`;
      line.style.background = "#ccc";
      grid.appendChild(line);
    }

    for (let r = 1; r < GRID_ROWS; r++) {
      const line = document.createElement("div");
      line.style.position = "absolute";
      line.style.top = `${r * CELL_SIZE}px`;
      line.style.left = "0";
      line.style.height = "1px";
      line.style.width = `${GRID_WIDTH}px`;
      line.style.background = "#ccc";
      grid.appendChild(line);
    }

    /* ---------- Rendering ---------- */

    const imgEls = [];

    function render() {
      imgEls.forEach(el => el.remove());
      imgEls.length = 0;

      imageState.forEach((item, index) => {
        if (!item.introduced) return;

        const el = document.createElement("img");
        el.src = item.path;
        el.style.position = "absolute";
        el.style.left = `${item.stageX}px`;
        el.style.top  = `${item.stageY}px`;
        el.style.transform = "translate(-50%, -50%)";
        el.style.width = `${SMALL_SIZE}px`;
        el.style.height = `${SMALL_SIZE}px`;
        el.style.touchAction = "none";
        el.style.cursor = "grab";

        el.style.zIndex = item.zIndex || 1;
        stage.appendChild(el);
        imgEls.push(el);

        let scale = 1;

        if (dragState && dragState.index === index) {
          scale = DRAG_SCALE;
        }
        else if (!item.hasBeenMoved && index === currentFocusIdx) {
          scale = FOCAL_SCALE;
        }

        el.style.transform = `translate(-50%, -50%) scale(${scale})`;

        el.addEventListener("pointerdown", (e) => {

          e.preventDefault();

          const rect = stage.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;

          dragState = {
            index: index,
            offsetX: x - item.stageX,
            offsetY: y - item.stageY,
            pointerId: e.pointerId
          };

          highestZ++;
          item.zIndex = highestZ;
          el.style.zIndex = highestZ;

          el.setPointerCapture(e.pointerId);

          render();
        });
      });

      warningEl.textContent = warningMessage;
    }

    /* ---------- Dragging ---------- */

    stage.addEventListener("pointermove", (e) => {

      if (!dragState || e.pointerId !== dragState.pointerId) return;

      const rect = stage.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const index = dragState.index;

      const newX = x - dragState.offsetX;
      const newY = y - dragState.offsetY;

      imageState[index].stageX = newX;
      imageState[index].stageY = newY;

      const el = imgEls[index];
      if (el) {
        el.style.left = `${newX}px`;
        el.style.top = `${newY}px`;
      }
    });

    stage.addEventListener("pointerup", (e) => {

      if (!dragState || e.pointerId !== dragState.pointerId) return;

      const index = dragState.index;
      dragState = null;

      const item = imageState[index];

      item.hasBeenMoved = true;
      const el = imgEls[index];  
      const half = SMALL_SIZE / 2;

      item.stageX = clamp(
        item.stageX,
        GRID_X + half,
        GRID_X + GRID_WIDTH - half
      );

      item.stageY = clamp(
        item.stageY,
        GRID_Y + half,
        GRID_Y + GRID_HEIGHT - half
      );

      if (el) {
        el.style.left = `${item.stageX}px`;
        el.style.top = `${item.stageY}px`;
      }

      moveLog.push({
        participant,
        phase,
        block: blockNumber,
        trial: trialNumber,
        image: item.path.split("/").pop(),
        posX: item.stageX,
        posY: item.stageY,
        timestamp: performance.now()
      });

// --- ADDED LOGIC: Spawn the next image in the sequence ---
      if (!allImagesShown && index === currentFocusIdx && item.hasBeenMoved) {
        if (currentFocusIdx < imageState.length - 1) {
          // Bring in the next image
          currentFocusIdx++;
          imageState[currentFocusIdx].introduced = true;

          // Renamed to nextPos to avoid conflict
          const nextPos = getLeftStartPosition(); 
          imageState[currentFocusIdx].stageX = nextPos.x;
          imageState[currentFocusIdx].stageY = nextPos.y;

          highestZ++;
          imageState[currentFocusIdx].zIndex = highestZ;
        } else {
          // If there are no more images, show the Continue button
          allImagesShown = true;
          continueBtn.style.display = "inline-block";
        }
      }

      render();
    });

    // --- ADDED LOGIC: Make the Continue button actually finish the trial ---
    continueBtn.addEventListener("click", () => {

      const placements = imageState.map(item => ({
        image_name: item.path.split("/").pop(),
        posX: item.stageX,
        posY: item.stageY
      }));

      jsPsych.finishTrial({
        participant,
        phase,
        block: blockNumber,
        trial: trialNumber,
        placements: JSON.stringify(placements),
        move_log: JSON.stringify(moveLog),
        is_final_summary: 1
      });

    });

    /* ---------- Start ---------- */

    imageState[0].introduced = true;

    const startPos = getLeftStartPosition();
    imageState[0].stageX = startPos.x;
    imageState[0].stageY = startPos.y;

    render();
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

const BALLOON_IMAGES = [
  "stimuli/balloons/balloon_red.png",
  "stimuli/balloons/balloon_blue.png",
  "stimuli/balloons/balloon_green.png",
  "stimuli/balloons/balloon_yellow.png",
  "stimuli/balloons/balloon_purple.png",
  "stimuli/balloons/balloon_pink.png",
  "stimuli/balloons/balloon_violet.png",
  "stimuli/balloons/balloon_orange.png"
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
      Version (1–12):<br>
      <input id="version-input"
             type="number"
             min="1"
             max="12"
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

      if (!version || version < 1 || version > 12) {
        alert("Version must be between 1 and 12.");
        return;
      }

      window.PARTICIPANT_ID = pid;
      window.VERSION = version;

      /* ---------- BUILD COUNTERBALANCE AFTER VERSION ENTERED ---------- */

      const CATEGORY_ORDERS = [
        ["animals","emotions","plants"],
        ["animals","plants","emotions"],
        ["emotions","animals","plants"],
        ["emotions","plants","animals"],
        ["plants","animals","emotions"],
        ["plants","emotions","animals"]
      ];

      randomizedCategoryOrder =
        CATEGORY_ORDERS[(version - 1) % 6];

      useReverseSetOrder = version > 6;

      MAIN_BLOCKS = [];

      randomizedCategoryOrder.forEach(category => {

        const firstSetIndex = useReverseSetOrder ? 1 : 0;
        const secondSetIndex = useReverseSetOrder ? 0 : 1;

        const firstImages = CATEGORIES[category][firstSetIndex];
        const secondImages = CATEGORIES[category][secondSetIndex];

        const blockTrials = [
          jsPsychInstance.randomization.shuffle([...firstImages]),
          jsPsychInstance.randomization.shuffle([...secondImages])
        ];

        MAIN_BLOCKS.push(blockTrials);
      });

      /* ---------- BUILD MAIN TIMELINE NOW THAT MAIN_BLOCKS EXISTS ---------- */

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
            participant: pid,
            phase: "main",
            block_number: b + 1,
            trial_number: globalTrialNumber,
            trial_number_in_block: t + 1,
            total_trials: TOTAL_MAIN_TRIALS,
            total_trials_in_block: TRIALS_PER_BLOCK,
            images: shuffledImages,
            image_order: shuffledImages
          });

          timeline.push(attention_star_page);

          globalTrialNumber++;
        }

        if (b < NUM_BLOCKS - 1) {
          timeline.push(balloonMiniGame(10));
          timeline.push(makeCelebrationPage("Great job! Ready for the next round?"));
        }
      }

      jsPsychInstance.data.addProperties({
        participant_id: pid,
        version: version
      });

      timeline.push(save_data);
      timeline.push(finish_page);

      jsPsychInstance.finishTrial();
    });
  }
};

const preload_trial = {
  type: jsPsychPreload,
  images: [
    ...Object.values(CATEGORIES).flat(2),
    ...BALLOON_IMAGES,
    ...MINI_PRACTICE_IMAGES,
    ...MINI_PRACTICE_IMAGES_2
  ]
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

const mini_practice_trial_2 = {
  type: EmotionGridPlugin,
  participant: DEMO_PARTICIPANT,
  phase: "practice",
  trial_number: -2,  // just to distinguish it
  total_trials: 1,
  images: MINI_PRACTICE_IMAGES_2
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

function getLeftStartPosition() {
  const focalWidth = SMALL_SIZE * FOCAL_SCALE;
  const half = focalWidth / 2;

  return {
    x: half + 40,  // 40px padding from stage left
    y: GRID_Y + GRID_HEIGHT / 2
  };
}

function balloonMiniGame(totalBalloons = 10) {
  return {
    type: jsPsychHtmlButtonResponse,
    stimulus: `
      <div id="balloon-stage" style="
        position:relative;
        width:100vw;
        height:100vh;
        overflow:hidden;
        background: linear-gradient(#87CEEB, #E0F7FF);
      "></div>

      <style>
        .balloon {
          position:absolute;
          width:150px;
          height:150px;
          cursor:pointer;
          user-select:none;
          touch-action: manipulation;
          transition: transform 0.15s ease;
        }

        .balloon:active {
          transform: scale(1.1);
        }

        .pop {
          animation: popAnim 0.35s forwards;
        }

        @keyframes popAnim {
          0%   { transform: scale(1); opacity:1; }
          100% { transform: scale(1.8); opacity:0; }
        }
      </style>
    `,
    choices: [],
    on_load: function() {

      const stage = document.getElementById("balloon-stage");

      const balloonImages = [
        "stimuli/balloons/balloon_red.png",
        "stimuli/balloons/balloon_blue.png",
        "stimuli/balloons/balloon_green.png",
        "stimuli/balloons/balloon_yellow.png",
        "stimuli/balloons/balloon_purple.png",
        "stimuli/balloons/balloon_pink.png",
        "stimuli/balloons/balloon_violet.png",
        "stimuli/balloons/balloon_orange.png"
      ];

      let poppedCount = 0;

      function showBalloon() {

        // END condition
        if (poppedCount >= totalBalloons) {

          const doneButton = document.createElement("button");
          doneButton.textContent = "Continue";

          doneButton.style.position = "absolute";
          doneButton.style.left = "50%";
          doneButton.style.top = "50%";
          doneButton.style.transform = "translate(-50%, -50%)";
          doneButton.style.fontSize = "28px";
          doneButton.style.padding = "20px 50px";
          doneButton.style.borderRadius = "16px";
          doneButton.style.background = "#4CAF50";
          doneButton.style.color = "white";
          doneButton.style.border = "none";
          doneButton.style.cursor = "pointer";

          doneButton.addEventListener("click", () => {
            jsPsychInstance.finishTrial();
          });

          stage.appendChild(doneButton);
          return;
        }

        // CREATE BALLOON
        const balloon = document.createElement("img");
        balloon.className = "balloon";

        balloon.src =
          balloonImages[Math.floor(Math.random() * balloonImages.length)];

        const maxX = window.innerWidth - 140;
        const maxY = window.innerHeight - 200;

        balloon.style.left = Math.random() * maxX + "px";
        balloon.style.top = Math.random() * maxY + "px";

        balloon.addEventListener("pointerdown", function() {

          balloon.classList.add("pop");

          setTimeout(() => {
            balloon.remove();
            poppedCount++;
            showBalloon();   //call next balloon
          }, 300);
        });

        stage.appendChild(balloon);
      }

      //start first balloon
      showBalloon();
    }
  };
}


const timeline = [
  participant_info_trial,
  preload_trial,
  practice_intro,
  sorting_correct_page,
  sorting_wrong_page,
  makePreviewPage(MINI_PRACTICE_IMAGES_2),
  mini_practice_trial_2,
  makeCelebrationPage("Awesome! Now you're ready!"),

  main_intro
];

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

jsPsychInstance.run(timeline);