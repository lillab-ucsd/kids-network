/*************************************************
 * KIDS SEMANTIC NETWORK DEMO
 * 1 practice trial + 5 main trials
 * 6 images per trial
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

const MAIN_TRIALS = [
  [
    "stimuli/birds/peacock.jpg",
    "stimuli/birds/penguin.jpg",
    "stimuli/birds/pigeon.jpg",
    "stimuli/birds/seagull.jpg",
    "stimuli/birds/swan.jpg",
    "stimuli/birds/crow.jpg"
  ],
  [
    "stimuli/insects/ant.jpg",
    "stimuli/insects/bee.jpg",
    "stimuli/insects/beetle.jpg",
    "stimuli/insects/butterfly.jpg",
    "stimuli/insects/ladybug.jpg",
    "stimuli/insects/moth.jpg"
  ],
  [
    "stimuli/plants/grass.jpg",
    "stimuli/plants/cactus.jpg",
    "stimuli/plants/daisy.jpg",
    "stimuli/plants/pine_tree.jpg",
    "stimuli/plants/walnut.jpg",
    "stimuli/plants/acorn.jpg"
  ],
  [
    "stimuli/vegetables/broccoli.jpg",
    "stimuli/vegetables/cabbage.jpg",
    "stimuli/vegetables/cauliflower.jpg",
    "stimuli/vegetables/celery.jpg",
    "stimuli/vegetables/spinach.jpg",
    "stimuli/vegetables/beet.jpg"
  ],
  [
    "stimuli/substance/paper.jpg",
    "stimuli/substance/sand.jpg",
    "stimuli/substance/salt.jpg",
    "stimuli/substance/ice.jpg",
    "stimuli/substance/marble.jpg",
    "stimuli/substance/glue.jpg"
  ]
];

const NUM_MAIN_TRIALS = 5;
const GRID_COLS = 10;
const GRID_ROWS = 6;
const CELL_SIZE = 90;

const SMALL_SIZE = 80;
const BIG_SIZE = 120;
const CONFLICT_OFFSET = 50;

const GRID_WIDTH = GRID_COLS * CELL_SIZE;
const GRID_HEIGHT = GRID_ROWS * CELL_SIZE;

function getStartPositions() {
  const spacing = 140;
  const startY = GRID_HEIGHT + 110; 
  const totalWidth = spacing * 5;  
  const startX = (GRID_WIDTH - totalWidth) / 2;

  return Array.from({ length: 6 }, (_, i) => [
    startX + i * spacing,
    startY
  ]);
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

function downloadCSV(filename, rows) {
  if (!rows.length) return;

  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      }).join(",")
    )
  ].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

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

    const imageState = trialImages.map((imgPath, i) => ({
      path: imgPath,
      centerPos: null,
      index: i
    }));

    let dragState = null;
    let warningMessage = "";

    display_element.innerHTML = `
      <div id="task-wrapper">
        <div id="trial-label">
          ${phase === "practice" ? "Practice Trial" : `Main Trial ${trialNumber} of ${totalTrials}`}
        </div>
        <div id="task-instructions">
          Drag all 6 pictures into the grid.<br>
          Only one picture can occupy each square.<br>
          Press <b>N</b> when all 6 pictures are placed.
        </div>
        <div id="grid-container"></div>
        <div id="warning-text"></div>
      </div>
    `;

    const container = display_element.querySelector("#grid-container");
    const warningEl = display_element.querySelector("#warning-text");

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

    const startPositions = getStartPositions();

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
        el.setPointerCapture(e.pointerId);
        startDrag(e.clientX, e.clientY);
      });

      el.addEventListener("pointermove", (e) => {
        if (!dragState || dragState.index !== index) return;

        const rect = getRect();
        let left = e.clientX - rect.left - dragState.offsetX;
        let top = e.clientY - rect.top - dragState.offsetY;

        left = clamp(left, 0, rect.width);
        top = clamp(top, 0, rect.height + 160);

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

    const keyHandler = (e) => {
      const key = e.key.toLowerCase();

      if (key === "n") {
        if (!allPlacedInUniqueSquares()) {
          warningMessage = "Place all 6 pictures into different grid squares first.";
          renderImages();
          return;
        }

        imageState.forEach(item => {
          item.centerPos = getSnappedOrNull(item.centerPos);
        });

        const placements = imageState.map(item => ({
          participant,
          phase,
          trial: trialNumber,
          image: getFileName(item.path),
          final_img_pos: `(${Math.round(item.centerPos[0])}, ${Math.round(item.centerPos[1])})`,
          posX: Math.round(item.centerPos[0]),
          posY: Math.round(item.centerPos[1])
        }));

        document.removeEventListener("keydown", keyHandler);
        display_element.innerHTML = "";

        this.jsPsych.finishTrial({
          participant,
          phase,
          trial: trialNumber,
          placements
        });
      }

      if (key === "escape") {
        document.removeEventListener("keydown", keyHandler);
        this.jsPsych.endExperiment("Experiment ended.");
      }
    };

    document.addEventListener("keydown", keyHandler);
    renderImages();
  }
}

EmotionGridPlugin.info = {
  name: "emotion-grid",
  parameters: {}
};


const jsPsychInstance = initJsPsych({
  on_finish: function() {
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
});

const allImagesToPreload = [
  ...PRACTICE_IMAGES,
  ...MAIN_TRIALS.flat()
];

const preload_trial = {
  type: jsPsychPreload,
  images: allImagesToPreload
};

const intro_trial = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size:24px; line-height:1.6; max-width:1000px; margin:auto;">
      <p>This is a demo version.</p>
      <p>You will first complete <b>1 practice trial</b>.</p>
      <p>After that, you will complete <b>5 main trials</b>.</p>
      <p>On each trial, <b>6 pictures</b> will appear below the grid.</p>
      <p>Drag each picture into the grid and arrange them however you think is best.</p>
      <p>All 6 pictures must end up inside the grid, and each square can hold only one picture.</p>
      <p>When all 6 pictures are placed, press <b>N</b> to continue.</p>
      <p>Press any key to begin.</p>
    </div>
  `
};

const practice_intro = {
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size:26px; line-height:1.6;">
      Practice Trial<br><br>
      Press any key to begin.
    </div>
  `
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
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size:26px; line-height:1.6;">
      The practice trial is complete.<br><br>
      You will now begin the 5 main trials.<br><br>
      Press any key to continue.
    </div>
  `
};

const timeline = [
  preload_trial,
  intro_trial,
  practice_intro,
  practice_trial,
  main_intro
];

for (let i = 0; i < NUM_MAIN_TRIALS; i++) {
  timeline.push({
    type: EmotionGridPlugin,
    participant: DEMO_PARTICIPANT,
    phase: "main",
    trial_number: i + 1,
    total_trials: NUM_MAIN_TRIALS,
    images: MAIN_TRIALS[i]
  });
}

timeline.push({
  type: jsPsychHtmlKeyboardResponse,
  stimulus: `
    <div style="font-size:28px; line-height:1.6;">
      Done. Thank you!<br><br>
      Your CSV download should start automatically.<br><br>
      Press any key to finish.
    </div>
  `
});

jsPsychInstance.run(timeline);