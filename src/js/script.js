// ===============================
// GLOBAL STATE
// ===============================
window.gameState = {
  currentPlayer: "X",
  gameOver: false,
};

window.scoreX = 0;
window.scoreO = 0;

window.gameMode = "playerVsComputer";

// ===============================
// TIMER STATE
// ===============================
window.gameTimer = {
  seconds: 0,
  interval: null,
  running: false
};

// ===============================
// DOM ELEMENTS
// ===============================
const board = document.getElementById("game-board");
const gameOverMessage = document.getElementById("game-over-message");
const restartButton = document.getElementById("restart-button");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const themeToggle = document.getElementById("theme-toggle");
const vsComputerRadio = document.getElementById("vsComputer");
const vsPlayerRadio = document.getElementById("vsPlayer");
const resetButton = document.getElementById("reset-score-button");

// Sounds
const winSound = new Audio("./src/sounds/win.mp3");
const loseSound = new Audio("./src/sounds/lose.mp3");
const drawSound = new Audio("./src/sounds/draw.mp3");

// ===============================
// IMPORT GAME LOGIC
// ===============================
function getGameLogic() {
  return window.gameLogic || null;
}

// ===============================
// INITIALIZE BOARD
// ===============================
function initializeBoard() {
  board.innerHTML = "";
  for (let i = 0; i < 9; i++) {
    board.appendChild(createCell());
  }
  updateScoreDisplay();
}

function createCell() {
  const cell = document.createElement("div");
  cell.classList.add("cell");
  cell.addEventListener("click", handleCellClick);
  return cell;
}

function getCells() {
  return Array.from(document.querySelectorAll(".cell"));
}
window.getCells = getCells;

// ===============================
// CHECK WIN / DRAW
// ===============================
function checkWinner() {
  const cells = getCells();
  const values = cells.map(c => c.textContent);
  const logic = getGameLogic();
  const result = logic ? logic.checkWinner(values) : null;

  if (result) {
    const [a, b, c] = result.combo;
    highlightWinner(cells[a], cells[b], cells[c]);
    return true;
  }
  return false;
}
window.checkWinner = checkWinner;

function highlightWinner(a, b, c) {
  a.classList.add("winner");
  b.classList.add("winner");
  c.classList.add("winner");
}

function checkDraw() {
  const cells = getCells();
  return cells.every(c => c.textContent !== "");
}
window.checkDraw = checkDraw;

// ===============================
// AI MOVE
// ===============================
function findBestMove() {
  const cells = getCells().map(c => c.textContent);
  const logic = getGameLogic();
  const idx = logic ? logic.findBestMove(cells) : null;
  return idx !== null ? document.querySelectorAll(".cell")[idx] : null;
}
window.findBestMove = findBestMove;

// ===============================
// SCORE UPDATE
// ===============================
function updateScoreDisplay(prevX = window.scoreX, prevO = window.scoreO) {
  scoreXElement.textContent = window.scoreX;
  scoreOElement.textContent = window.scoreO;

  if (window.scoreX > prevX) {
    animateScore(scoreXElement);
  }
  if (window.scoreO > prevO) {
    animateScore(scoreOElement);
  }
}

function animateScore(el) {
  el.classList.remove("score-animate");
  void el.offsetWidth;
  el.classList.add("score-animate");
}

scoreXElement.addEventListener("animationend", () =>
  scoreXElement.classList.remove("score-animate")
);

scoreOElement.addEventListener("animationend", () =>
  scoreOElement.classList.remove("score-animate")
);

// ===============================
// TIMER FIXED VERSION
// ===============================
function startTimer() {
  if (window.gameTimer.running) return;

  window.gameTimer.running = true;
  window.gameTimer.interval = setInterval(() => {
    window.gameTimer.seconds++;
    updateTimerUI();
  }, 1000);
}

function stopTimer() {
  clearInterval(window.gameTimer.interval);
  window.gameTimer.running = false;
}

function resetTimer() {
  stopTimer();
  window.gameTimer.seconds = 0;
  updateTimerUI();
}

function updateTimerUI() {
  const t = document.getElementById("timer");
  t.textContent = `Time: ${window.gameTimer.seconds}s`;
}

// ===============================
// PLAYER MOVE (FIX TIMER BUG)
// ===============================
function handleCellClick(event) {
  const cell = event.target;

  if (cell.textContent !== "" || window.gameState.gameOver) return;

  // Start timer ONLY once
  startTimer();

  cell.textContent = window.gameState.currentPlayer;

  // WIN
  if (checkWinner()) {
    gameOverMessage.textContent = `${window.gameState.currentPlayer} wins!`;
    gameOverMessage.style.display = "block";
    window.gameState.gameOver = true;
    restartButton.style.display = "block";
    stopTimer();

    if (window.gameState.currentPlayer === "X") {
      const prev = window.scoreX;
      window.scoreX++;
      winSound.play();
      updateScoreDisplay(prev, window.scoreO);
    } else {
      const prev = window.scoreO;
      window.scoreO++;
      loseSound.play();
      updateScoreDisplay(window.scoreX, prev);
    }
    return;
  }

  // DRAW
  if (checkDraw()) {
    gameOverMessage.textContent = "It's a draw!";
    gameOverMessage.style.display = "block";
    window.gameState.gameOver = true;
    restartButton.style.display = "block";
    stopTimer();
    drawSound.play();
    return;
  }

  // SWITCH PLAYER
  window.gameState.currentPlayer = window.gameState.currentPlayer === "X" ? "O" : "X";

  // AI MOVE
  if (window.gameMode === "playerVsComputer" && window.gameState.currentPlayer === "O") {
    setTimeout(computerMove, 400);
  }
}
window.handleCellClick = handleCellClick;

// ===============================
// COMPUTER MOVE
// ===============================
function computerMove() {
  if (window.gameState.gameOver) return;

  const best = findBestMove();
  if (!best) return;

  best.textContent = "O";

  if (checkWinner()) {
    gameOverMessage.textContent = "O wins!";
    gameOverMessage.style.display = "block";
    window.gameState.gameOver = true;
    restartButton.style.display = "block";
    stopTimer();

    const prev = window.scoreO;
    window.scoreO++;
    loseSound.play();
    updateScoreDisplay(window.scoreX, prev);
    return;
  }

  if (checkDraw()) {
    gameOverMessage.textContent = "It's a draw!";
    gameOverMessage.style.display = "block";
    window.gameState.gameOver = true;
    restartButton.style.display = "block";
    stopTimer();
    drawSound.play();
    return;
  }

  window.gameState.currentPlayer = "X";
}
window.computerMove = computerMove;

// ===============================
// RESTART + RESET
// ===============================
function restartGame() {
  window.gameState.currentPlayer = "X";
  window.gameState.gameOver = false;
  gameOverMessage.style.display = "none";

  getCells().forEach(c => {
    c.textContent = "";
    c.classList.remove("winner");
  });

  resetTimer();
}
window.restartGame = restartGame;

function resetScores() {
  window.scoreX = 0;
  window.scoreO = 0;
  updateScoreDisplay();
  restartGame();
}
window.resetScores = resetScores;

// ===============================
// ON LOAD
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  initializeBoard();

  restartButton.addEventListener("click", restartGame);
  resetButton.addEventListener("click", resetScores);

  // Theme
  if (themeToggle) {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      themeToggle.checked = true;
      document.body.classList.add("dark-mode");
    }

    themeToggle.addEventListener("change", () => {
      if (themeToggle.checked) {
        document.body.classList.add("dark-mode");
        localStorage.setItem("theme", "dark");
      } else {
        document.body.classList.remove("dark-mode");
        localStorage.setItem("theme", "light");
      }
    });
  }

  // Mode selection
  if (vsComputerRadio) {
    window.gameMode = "playerVsComputer";
    vsComputerRadio.addEventListener("change", () => {
      window.gameMode = "playerVsComputer";
      resetScores();
    });
  }

  if (vsPlayerRadio) {
    vsPlayerRadio.addEventListener("change", () => {
      window.gameMode = "playerVsFriend";
      resetScores();
    });
  }
});
