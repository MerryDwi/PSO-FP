// ===============================
// GLOBAL STATE (NOW SAFE FOR JEST & BROWSER)
// ===============================
const isNode = typeof window === "undefined";

if (!isNode) {
  window.gameState = { currentPlayer: "X", gameOver: false };
  window.scoreX = 0;
  window.scoreO = 0;
  window.gameMode = "playerVsComputer";

  window.gameTimer = {
    seconds: 0,
    interval: null,
    running: false
  };
}

// Fallback for Jest environment
const globalNS = isNode ? {} : window;

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

// Sounds
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
  document.getElementById("timer").textContent =
    "Time: " + globalNS.gameTimer.seconds + "s";
}

// ===============================
// PLAYER MOVE
// ===============================
function handleCellClick(event) {
  const cell = event.target;

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
    gameOverMessage.textContent = text;
    gameOverMessage.style.display = "block";
    restartButton.style.display = "block";
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
    drawSound.play();
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
    gameOverMessage.style.display = "none";
    restartButton.style.display = "none";
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
    restartButton.addEventListener("click", restartGame);
    resetButton.addEventListener("click", resetScores);

    vsComputerRadio.addEventListener("change", () => {
      globalNS.gameMode = "playerVsComputer";
      restartGame();
    });

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
