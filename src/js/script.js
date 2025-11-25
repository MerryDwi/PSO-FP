// ===============================
// FIX FOR JEST ENVIRONMENT
// ===============================

// Jest uses JSDOM which has window, so we must detect Jest manually
const isTestEnv =
  typeof process !== "undefined" &&
  process.env.JEST_WORKER_ID !== undefined;

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
const globalNS = isNode ? (globalThis.__tiny_tactics_ns__ = globalThis.__tiny_tactics_ns__ || {}) : window;

// Ensure Node/Jest has default state values (fallbacks)
globalNS.gameState = globalNS.gameState || { currentPlayer: "X", gameOver: false };
globalNS.scoreX = typeof globalNS.scoreX === "number" ? globalNS.scoreX : 0;
globalNS.scoreO = typeof globalNS.scoreO === "number" ? globalNS.scoreO : 0;
globalNS.gameMode = globalNS.gameMode || "playerVsComputer";
globalNS.gameTimer = globalNS.gameTimer || { seconds: 0, interval: null, running: false };

// ===============================
// DOM ELEMENTS (AUTO-MOCK SAFE)
// ===============================
let board,
  gameOverMessage,
  restartButton,
  scoreXElement,
  scoreOElement,
  themeToggle,
  vsComputerRadio,
  vsPlayerRadio,
  resetButton;

if (!isNode) {
  board = document.getElementById("game-board");
  gameOverMessage = document.getElementById("game-over-message");
  restartButton = document.getElementById("restart-button");
  scoreXElement = document.getElementById("scoreX");
  scoreOElement = document.getElementById("scoreO");
  themeToggle = document.getElementById("theme-toggle");
  vsComputerRadio = document.getElementById("vsComputer");
  vsPlayerRadio = document.getElementById("vsPlayer");
  resetButton = document.getElementById("reset-score-button");
}

// Sounds (no-op in Node)
const winSound = !isNode ? new Audio("./src/sounds/win.mp3") : { play() {} };
const loseSound = !isNode ? new Audio("./src/sounds/lose.mp3") : { play() {} };
const drawSound = !isNode ? new Audio("./src/sounds/draw.mp3") : { play() {} };

// ===============================
// GAME LOGIC LOADER
// ===============================
function getGameLogic() {
  return globalNS.gameLogic || null;
}

// ===============================
// BOARD
// ===============================
function initializeBoard() {
  if (isNode) return;

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
  return isNode ? [] : Array.from(document.querySelectorAll(".cell"));
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
  if (result && !isNode) {
    const [a, b, c] = result.combo;
    highlightWinner(cells[a], cells[b], cells[c]);
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
  const logic = getGameLogic();
  if (!logic) return null;

  const values = getCells().map((c) => c.textContent);
  const i = logic.findBestMove(values);
  return i !== null && !isNode ? document.querySelectorAll(".cell")[i] : i;
}
globalNS.findBestMove = findBestMove;

// ===============================
// SCORE UPDATE
// ===============================
function updateScoreDisplay(prevX = globalNS.scoreX, prevO = globalNS.scoreO) {
  if (isNode) return;

  scoreXElement.textContent = globalNS.scoreX;
  scoreOElement.textContent = globalNS.scoreO;
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
    finishGame(globalNS.gameState.currentPlayer + " wins!");
    if (globalNS.gameState.currentPlayer === "X") {
      globalNS.scoreX++;
      winSound.play();
    } else {
      globalNS.scoreO++;
      loseSound.play();
    }
    updateScoreDisplay();
    return;
  }

  if (checkDraw()) {
    finishGame("It's a draw!");
    drawSound.play();
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
// FINISH GAME
// ===============================
function finishGame(text) {
  globalNS.gameState.gameOver = true;
  if (!isNode) {
    if (gameOverMessage) {
      gameOverMessage.textContent = text;
      gameOverMessage.style.display = "block";
    }
    if (restartButton) restartButton.style.display = "block";
  }
  stopTimer();
}

// ===============================
// COMPUTER MOVE
// ===============================
function computerMove() {
  if (globalNS.gameState.gameOver) return;

  const best = findBestMove();
  if (best && !isNode) {
    best.textContent = "O";
  }

  if (checkWinner()) {
    finishGame("O wins!");
    globalNS.scoreO++;
    loseSound.play();
    updateScoreDisplay();
    return;
  }

  if (checkDraw()) {
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

  if (!isNode) {
    getCells().forEach((c) => {
      c.textContent = "";
      c.classList.remove("winner");
    });
    if (gameOverMessage) gameOverMessage.style.display = "none";
    if (restartButton) restartButton.style.display = "none";
  }

  resetTimer();
}
globalNS.restartGame = restartGame;

function resetScores() {
  globalNS.scoreX = 0;
  globalNS.scoreO = 0;
  updateScoreDisplay();
  restartGame();
}
globalNS.resetScores = resetScores;

// ===============================
// DOM READY
// ===============================
if (!isNode) {
  document.addEventListener("DOMContentLoaded", () => {
    initializeBoard();
    if (restartButton) restartButton.addEventListener("click", restartGame);
    if (resetButton) resetButton.addEventListener("click", resetScores);

    if (vsComputerRadio)
      vsComputerRadio.addEventListener("change", () => {
        globalNS.gameMode = "playerVsComputer";
        restartGame();
      });

    if (vsPlayerRadio)
      vsPlayerRadio.addEventListener("change", () => {
        globalNS.gameMode = "playerVsFriend";
        restartGame();
      });
  });
}

// ===============================
// EXPORT FOR JEST
// ===============================
if (isNode) {
  module.exports = {
    gameState: globalNS.gameState,
    gameMode: globalNS.gameMode,
    scoreX: globalNS.scoreX,
    scoreO: globalNS.scoreO,
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
  };
}
