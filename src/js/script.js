// ===============================
// FIX FOR JEST ENVIRONMENT
// ===============================

// Jest uses JSDOM which has window, so we must detect Jest manually
const isTestEnv =
  typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;

// In Jest → isNode must be TRUE
const isNode = isTestEnv || typeof window === "undefined";

// ===============================
// GLOBAL STATE (SAFE FOR BROWSER & JEST)
// ===============================

if (!isNode) {
  // Browser: put state on window
  window.gameState = { currentPlayer: "X", gameOver: false };
  window.scoreX = 0;
  window.scoreO = 0;
  window.gameMode = "playerVsComputer";

  window.gameTimer = {
    seconds: 0,
    interval: null,
    running: false,
  };
}

// globalNS will host state both for browser (window) and node ({} or global)
const globalNS = isNode
  ? (globalThis.__tiny_tactics_ns__ = globalThis.__tiny_tactics_ns__ || {})
  : window;

// Ensure Node/Jest has default state values (fallbacks)
globalNS.gameState = globalNS.gameState || {
  currentPlayer: "X",
  gameOver: false,
};
globalNS.scoreX = typeof globalNS.scoreX === "number" ? globalNS.scoreX : 0;
globalNS.scoreO = typeof globalNS.scoreO === "number" ? globalNS.scoreO : 0;
globalNS.gameMode = globalNS.gameMode || "playerVsComputer";
globalNS.gameTimer = globalNS.gameTimer || {
  seconds: 0,
  interval: null,
  running: false,
};

// ===============================
// DOM ELEMENTS (AUTO-MOCK SAFE)
// ===============================
// Helper functions to get DOM elements dynamically (works in both browser and test)
function getGameOverMessage() {
  return typeof document !== "undefined"
    ? document.getElementById("game-over-message")
    : null;
}

function getRestartButton() {
  return typeof document !== "undefined"
    ? document.getElementById("restart-button")
    : null;
}

function getScoreXElement() {
  return typeof document !== "undefined"
    ? document.getElementById("scoreX")
    : null;
}

function getScoreOElement() {
  return typeof document !== "undefined"
    ? document.getElementById("scoreO")
    : null;
}

function getThemeToggle() {
  return typeof document !== "undefined"
    ? document.getElementById("theme-toggle")
    : null;
}

function getVsComputerRadio() {
  return typeof document !== "undefined"
    ? document.getElementById("vsComputer")
    : null;
}

function getVsPlayerRadio() {
  return typeof document !== "undefined"
    ? document.getElementById("vsPlayer")
    : null;
}

function getResetButton() {
  return typeof document !== "undefined"
    ? document.getElementById("reset-score-button")
    : null;
}

function getBoard() {
  return typeof document !== "undefined"
    ? document.getElementById("game-board")
    : null;
}

// Sounds (works in both browser and test)
let winSound, loseSound, drawSound;
if (typeof window !== "undefined" && window.Audio) {
  winSound = new Audio("./src/sounds/win.mp3");
  loseSound = new Audio("./src/sounds/lose.mp3");
  drawSound = new Audio("./src/sounds/draw.mp3");
} else {
  // Fallback - create mock objects that call the prototype if available
  const createSoundMock = () => ({
    play() {
      if (
        typeof window !== "undefined" &&
        window.HTMLMediaElement &&
        window.HTMLMediaElement.prototype.play
      ) {
        window.HTMLMediaElement.prototype.play.call(this);
      }
    },
  });
  winSound = createSoundMock();
  loseSound = createSoundMock();
  drawSound = createSoundMock();
}

// ===============================
// GAME LOGIC LOADER
// ===============================
function getGameLogic() {
  // Check globalNS first, then window (for Jest tests)
  if (globalNS.gameLogic) return globalNS.gameLogic;
  if (typeof window !== "undefined" && window.gameLogic) {
    globalNS.gameLogic = window.gameLogic; // Cache it
    return window.gameLogic;
  }
  return null;
}

// ===============================
// BOARD
// ===============================
function initializeBoard() {
  const board = getBoard();
  if (!board) return;

  board.innerHTML = "";
  for (let i = 0; i < 9; i++) board.appendChild(createCell());
  updateScoreDisplay();
}

function createCell() {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.addEventListener("click", handleCellClick);
  return cell;
}

function getCells() {
  if (typeof document !== "undefined" && document.querySelectorAll) {
    return Array.from(document.querySelectorAll(".cell"));
  }
  return [];
}
globalNS.getCells = getCells;

// ===============================
// WIN / DRAW
// ===============================
function checkWinner() {
  const logic = getGameLogic();
  const cells = getCells();
  const values = cells.map((c) => c.textContent);

  const result = logic ? logic.checkWinner(values) : null;
  if (result && cells.length > 0) {
    const [a, b, c] = result.combo;
    if (cells[a] && cells[b] && cells[c]) {
      highlightWinner(cells[a], cells[b], cells[c]);
    }
  }
  return result ? true : false;
}
globalNS.checkWinner = checkWinner;

function highlightWinner(a, b, c) {
  if (!a || !b || !c) return;
  a.classList.add("winner");
  b.classList.add("winner");
  c.classList.add("winner");
}

function checkDraw() {
  const logic = getGameLogic();
  const cells = getCells().map((c) => c.textContent);
  return logic ? logic.checkDraw(cells) : false;
}
globalNS.checkDraw = checkDraw;

// ===============================
// AI
// ===============================
function findBestMove() {
  // In test environment, check if function has been replaced
  if (
    isNode &&
    globalThis.__tiny_tactics_ns__ &&
    globalThis.__tiny_tactics_ns__.findBestMove &&
    globalThis.__tiny_tactics_ns__.findBestMove !== findBestMove
  ) {
    return globalThis.__tiny_tactics_ns__.findBestMove();
  }

  // Check if function has been replaced on globalNS (for testing)
  if (
    globalNS.findBestMove !== findBestMove &&
    typeof globalNS.findBestMove === "function"
  ) {
    return globalNS.findBestMove();
  }

  const logic = getGameLogic();
  if (!logic) return null;

  const values = getCells().map((c) => c.textContent);
  const i = logic.findBestMove(values);
  if (i !== null && typeof document !== "undefined") {
    const cells = document.querySelectorAll(".cell");
    return cells[i] || i;
  }
  return i;
}
globalNS.findBestMove = findBestMove;

// ===============================
// SCORE UPDATE
// ===============================
function updateScoreDisplay(prevX = globalNS.scoreX, prevO = globalNS.scoreO) {
  const scoreXElement = getScoreXElement();
  const scoreOElement = getScoreOElement();
  if (scoreXElement) scoreXElement.textContent = globalNS.scoreX;
  if (scoreOElement) scoreOElement.textContent = globalNS.scoreO;
}

// ===============================
// TIMER
// ===============================
function startTimer() {
  if (isNode) return;
  if (globalNS.gameTimer.running) return;
  globalNS.gameTimer.running = true;
  globalNS.gameTimer.interval = setInterval(() => {
    globalNS.gameTimer.seconds++;
    updateTimerUI();
  }, 1000);
}

function stopTimer() {
  if (isNode) return;
  clearInterval(globalNS.gameTimer.interval);
  globalNS.gameTimer.running = false;
}

function resetTimer() {
  if (isNode) return;
  stopTimer();
  globalNS.gameTimer.seconds = 0;
  updateTimerUI();
}

function updateTimerUI() {
  if (isNode) return;
  const t = document.getElementById("timer");
  if (t) t.textContent = "Time: " + globalNS.gameTimer.seconds + "s";
}

// ===============================
// PLAYER MOVE
// ===============================
function handleCellClick(event) {
  const cell = event.target;
  if (!cell) return;

  if (cell.textContent !== "" || globalNS.gameState.gameOver) return;
  startTimer();

  cell.textContent = globalNS.gameState.currentPlayer;

  if (checkWinner()) {
    const winner = globalNS.gameState.currentPlayer;
    if (winner === "X") {
      globalNS.scoreX++;
      winSound.play();
    } else {
      globalNS.scoreO++;
      loseSound.play();
    }
    updateScoreDisplay();
    finishGame(winner + " wins!");
    return;
  }

  if (checkDraw()) {
    drawSound.play();
    finishGame("It's a draw!");
    return;
  }

  globalNS.gameState.currentPlayer =
    globalNS.gameState.currentPlayer === "X" ? "O" : "X";

  if (
    globalNS.gameMode === "playerVsComputer" &&
    globalNS.gameState.currentPlayer === "O"
  ) {
    setTimeout(computerMove, 300);
  }
}
globalNS.handleCellClick = handleCellClick;

// ===============================
// SAVE SCORE TO FIRESTORE
// ===============================
function saveScoreToFirestore(result) {
  // Hanya simpan jika mode playerVsComputer
  if (globalNS.gameMode !== "playerVsComputer") {
    return;
  }

  // Cek apakah leaderboardService tersedia
  if (
    typeof window === "undefined" ||
    !window.leaderboardService ||
    !window.leaderboardService.saveScore
  ) {
    console.warn("Leaderboard service belum tersedia");
    return;
  }

  // Tentukan result: 'win', 'lose', atau 'draw'
  let gameResult = "draw";
  if (result.includes("X wins")) {
    gameResult = "win";
  } else if (result.includes("O wins")) {
    gameResult = "lose";
  }

  // Simpan score ke Firestore
  window.leaderboardService
    .saveScore(
      globalNS.scoreX,
      globalNS.scoreO,
      globalNS.gameTimer.seconds,
      gameResult
    )
    .then((docId) => {
      if (docId) {
        console.log("Score berhasil disimpan ke leaderboard");
      }
    })
    .catch((error) => {
      console.error("Gagal menyimpan score:", error);
    });
}

// ===============================
// FINISH GAME
// ===============================
function finishGame(text) {
  globalNS.gameState.gameOver = true;
  const gameOverMessage = getGameOverMessage();
  const restartButton = getRestartButton();
  if (gameOverMessage) {
    gameOverMessage.textContent = text;
    gameOverMessage.style.display = "block";
  }
  if (restartButton) restartButton.style.display = "block";
  stopTimer();

  // Simpan score ke Firestore setelah game selesai
  if (!isNode) {
    saveScoreToFirestore(text);
  }
}

// ===============================
// COMPUTER MOVE
// ===============================
function computerMove() {
  if (globalNS.gameState.gameOver) return;

  // In test environment, check globalThis directly to allow mocking
  let findBestMoveFn = globalNS.findBestMove;
  if (
    isNode &&
    globalThis.__tiny_tactics_ns__ &&
    globalThis.__tiny_tactics_ns__.findBestMove
  ) {
    findBestMoveFn = globalThis.__tiny_tactics_ns__.findBestMove;
  }
  const best = findBestMoveFn();
  let targetCell = null;

  if (best) {
    // Check if best is already a cell element (from mock or actual DOM)
    if (typeof best === "object") {
      // If it's an object (not a number), treat it as a cell element
      targetCell = best;
    } else if (typeof best === "number" && typeof document !== "undefined") {
      const cells = document.querySelectorAll(".cell");
      if (cells[best]) targetCell = cells[best];
    }
  }

  if (targetCell) {
    targetCell.textContent = "O";
  }

  if (checkWinner()) {
    globalNS.scoreO++;
    loseSound.play();
    updateScoreDisplay();
    finishGame("O wins!");
    return;
  }

  if (checkDraw()) {
    drawSound.play();
    finishGame("It's a draw!");
    return;
  }

  globalNS.gameState.currentPlayer = "X";
}
globalNS.computerMove = computerMove;

// ===============================
// RESTART / RESET
// ===============================
function restartGame() {
  globalNS.gameState.currentPlayer = "X";
  globalNS.gameState.gameOver = false;

  const cells = getCells();
  cells.forEach((c) => {
    c.textContent = "";
    if (c.classList) c.classList.remove("winner");
    if (c.style) c.style.backgroundColor = "";
  });

  const gameOverMessage = getGameOverMessage();
  const restartButton = getRestartButton();
  if (gameOverMessage) gameOverMessage.style.display = "none";
  if (restartButton) restartButton.style.display = "none";

  resetTimer();
}
globalNS.restartGame = restartGame;

function resetScores() {
  globalNS.scoreX = 0;
  globalNS.scoreO = 0;
  updateScoreDisplay();
}
globalNS.resetScores = resetScores;

// ===============================
// DOM READY
// ===============================
function setupEventListeners() {
  const restartButton = getRestartButton();
  const resetButton = getResetButton();
  const themeToggle = getThemeToggle();
  const vsComputerRadio = getVsComputerRadio();
  const vsPlayerRadio = getVsPlayerRadio();

  if (restartButton) restartButton.addEventListener("click", restartGame);
  if (resetButton) resetButton.addEventListener("click", resetScores);

  if (themeToggle) {
    themeToggle.addEventListener("change", () => {
      if (themeToggle.checked) {
        if (typeof document !== "undefined" && document.body) {
          document.body.classList.add("dark-mode");
        }
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("theme", "dark");
        }
      } else {
        if (typeof document !== "undefined" && document.body) {
          document.body.classList.remove("dark-mode");
        }
        if (typeof localStorage !== "undefined") {
          localStorage.setItem("theme", "light");
        }
      }
    });
  }

  if (vsComputerRadio) {
    vsComputerRadio.addEventListener("change", () => {
      if (vsComputerRadio.checked) {
        globalNS.gameMode = "playerVsComputer";
        restartGame();
        const gameOverMessage = getGameOverMessage();
        if (gameOverMessage) gameOverMessage.style.display = "none";
      }
    });
  }

  if (vsPlayerRadio) {
    vsPlayerRadio.addEventListener("change", () => {
      if (vsPlayerRadio.checked) {
        globalNS.gameMode = "playerVsFriend";
        restartGame();
        const gameOverMessage = getGameOverMessage();
        if (gameOverMessage) gameOverMessage.style.display = "none";
      }
    });
  }
}

if (!isNode) {
  document.addEventListener("DOMContentLoaded", () => {
    initializeBoard();
    setupEventListeners();
  });
} else {
  // In test environment, set up listeners immediately
  setupEventListeners();
}

// ===============================
// EXPORT FOR JEST
// ===============================
if (isNode) {
  module.exports = {
    get gameState() {
      return globalNS.gameState;
    },
    get gameMode() {
      return globalNS.gameMode;
    },
    set gameMode(val) {
      globalNS.gameMode = val;
    },
    get scoreX() {
      return globalNS.scoreX;
    },
    set scoreX(val) {
      globalNS.scoreX = val;
    },
    get scoreO() {
      return globalNS.scoreO;
    },
    set scoreO(val) {
      globalNS.scoreO = val;
    },
    startTimer,
    stopTimer,
    resetTimer,
    handleCellClick,
    checkWinner,
    checkDraw,
    findBestMove,
    computerMove,
    restartGame,
    resetScores,
    getCells,
    finishGame,
  };
}
