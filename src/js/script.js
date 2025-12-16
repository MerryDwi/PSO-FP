// ===============================
// FIX FOR JEST ENVIRONMENT
// ===============================

const isTestEnv =
  typeof process !== "undefined" && process.env.JEST_WORKER_ID !== undefined;
const isNode = isTestEnv || typeof window === "undefined";

// ===============================
// GLOBAL STATE (SAFE FOR BROWSER & JEST)
// ===============================

if (!isNode) {
  window.gameState = { currentPlayer: "X", gameOver: false };
  window.scoreX = 0;
  window.scoreO = 0;
  window.scoreDraw = 0;
  window.gameMode = "playerVsComputer";

  // Track game moves and board state
  window.gameMoves = [];
  window.boardState = Array(9).fill("");
  
  // REMOVED: OLD timer system - now use window.gameTimer from game.html
}

const globalNS = isNode
  ? (globalThis.__tiny_tactics_ns__ = globalThis.__tiny_tactics_ns__ || {})
  : window;

globalNS.gameState = globalNS.gameState || {
  currentPlayer: "X",
  gameOver: false,
};
globalNS.scoreX = typeof globalNS.scoreX === "number" ? globalNS.scoreX : 0;
globalNS.scoreO = typeof globalNS.scoreO === "number" ? globalNS.scoreO : 0;
globalNS.scoreDraw =
  typeof globalNS.scoreDraw === "number" ? globalNS.scoreDraw : 0;
globalNS.gameMode = globalNS.gameMode || "playerVsComputer";
globalNS.gameMoves = globalNS.gameMoves || [];
globalNS.boardState = globalNS.boardState || Array(9).fill("");

// ===============================
// DOM ELEMENTS (AUTO-MOCK SAFE)
// ===============================
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

// Sounds
let winSound, loseSound, drawSound;
if (typeof window !== "undefined" && window.Audio) {
  winSound = new Audio("./src/sounds/win.mp3");
  loseSound = new Audio("./src/sounds/lose.mp3");
  drawSound = new Audio("./src/sounds/draw.mp3");
} else {
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
  if (globalNS.gameLogic) return globalNS.gameLogic;
  if (typeof window !== "undefined" && window.gameLogic) {
    globalNS.gameLogic = window.gameLogic;
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
  const currentCells = getCells();
  const availableMoves = currentCells
    .map((cell, index) => (cell.textContent === "" ? index : null))
    .filter((index) => index !== null);

  const checkWinnerForMinimax = (board, player) => {
    const winCombinations = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    return winCombinations.some(
      ([a, b, c]) => board[a] === player && board[b] === player && board[c] === player
    );
  };

  if (availableMoves.length === 0) return null;

  // 1) Menang jika bisa
  for (const move of availableMoves) {
    const temp = currentCells.map((c) => c.textContent);
    temp[move] = "O";
    if (checkWinnerForMinimax(temp, "O")) return currentCells[move];
  }

  // 2) Blokir kemenangan lawan
  for (const move of availableMoves) {
    const temp = currentCells.map((c) => c.textContent);
    temp[move] = "X";
    if (checkWinnerForMinimax(temp, "X")) return currentCells[move];
  }

  // 3) Ambil center jika kosong
  if (currentCells[4] && currentCells[4].textContent === "") return currentCells[4];

  // 4) Ambil corner acak
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => currentCells[i] && currentCells[i].textContent === "");
  if (availableCorners.length > 0) {
    const choice = availableCorners[Math.floor(Math.random() * availableCorners.length)];
    return currentCells[choice];
  }

  // 5) Ambil edge acak
  const edges = [1, 3, 5, 7];
  const availableEdges = edges.filter((i) => currentCells[i] && currentCells[i].textContent === "");
  if (availableEdges.length > 0) {
    const choice = availableEdges[Math.floor(Math.random() * availableEdges.length)];
    return currentCells[choice];
  }

  // 6) Fallback
  const rand = availableMoves[Math.floor(Math.random() * availableMoves.length)];
  return currentCells[rand];
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
// TIMER FUNCTIONS (USE FROM game.html)
// ===============================
function startTimer() {
  if (isNode) return;
  // Use timer from game.html
  if (window.gameTimer && window.gameTimer.start) {
    window.gameTimer.start();
  }
}

function stopTimer() {
  if (isNode) return;
  // Use timer from game.html
  if (window.gameTimer && window.gameTimer.stop) {
    window.gameTimer.stop();
  }
}

function resetTimer() {
  if (isNode) return;
  // Use timer from game.html
  if (window.gameTimer && window.gameTimer.reset) {
    window.gameTimer.reset();
  }
}

function getElapsedTime() {
  if (isNode) return 0;
  // Get elapsed time from game.html timer
  if (window.gameTimer && window.gameTimer.getElapsedTime) {
    return window.gameTimer.getElapsedTime();
  }
  return 0;
}

// ===============================
// PLAYER MOVE
// ===============================
function handleCellClick(event) {
  const cell = event.target;
  if (!cell) return;

  if (cell.textContent !== "" || globalNS.gameState.gameOver) return;
  
  // Start timer on first move
  startTimer();

  const board = getBoard();
  const cellIndex =
    board && board.children ? Array.from(board.children).indexOf(cell) : -1;
  const player = globalNS.gameState.currentPlayer;

  cell.textContent = player;

  if (globalNS.boardState && cellIndex >= 0) {
    globalNS.boardState[cellIndex] = player;
  }

  if (globalNS.gameMoves && cellIndex >= 0) {
    globalNS.gameMoves.push({
      player: player,
      position: cellIndex,
      timestamp: new Date().toISOString(),
    });
  }

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
    globalNS.scoreDraw++;
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
  if (globalNS.gameMode !== "playerVsComputer") {
    return;
  }

  if (
    typeof window === "undefined" ||
    !window.leaderboardService ||
    !window.leaderboardService.saveScore
  ) {
    console.warn("Leaderboard service belum tersedia");
    return;
  }

  let gameResult = "draw";
  if (result.includes("X wins")) {
    gameResult = "win";
  } else if (result.includes("O wins")) {
    gameResult = "lose";
  }

  // Get elapsed time from timer
  const gameTime = getElapsedTime();

  window.leaderboardService
    .saveScore(
      globalNS.scoreX,
      globalNS.scoreO,
      gameTime, // Use elapsed time from timer
      gameResult
    )
    .then(async (docId) => {
      if (docId) {
        console.log("Score berhasil disimpan ke leaderboard");

        if (globalNS.gameMoves && globalNS.gameMoves.length > 0) {
          await window.leaderboardService.saveGameHistory(
            globalNS.gameMoves,
            globalNS.boardState || Array(9).fill(""),
            docId
          );
        }

        const stats = {
          totalGames: 1,
          totalWins: gameResult === "win" ? 1 : 0,
          totalDraws: gameResult === "draw" ? 1 : 0,
          totalLosses: gameResult === "lose" ? 1 : 0,
          bestTime: gameTime,
          lastGameTime: gameTime,
        };
        await window.leaderboardService.saveGameStatistics(stats);

        const preferences = {
          theme:
            typeof localStorage !== "undefined"
              ? localStorage.getItem("theme") || "light"
              : "light",
          gameMode: globalNS.gameMode || "playerVsComputer",
        };
        await window.leaderboardService.saveUserPreferences(preferences);
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
  
  // Stop timer
  stopTimer();

  if (!isNode) {
    saveScoreToFirestore(text);
  }
}

// ===============================
// COMPUTER MOVE
// ===============================
function computerMove() {
  if (globalNS.gameState.gameOver) return;

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
    if (typeof best === "object") {
      targetCell = best;
    } else if (typeof best === "number" && typeof document !== "undefined") {
      const cells = document.querySelectorAll(".cell");
      if (cells[best]) targetCell = cells[best];
    }
  }

  if (targetCell) {
    targetCell.textContent = "O";

    const board = getBoard();
    const cellIndex =
      board && board.children
        ? Array.from(board.children).indexOf(targetCell)
        : -1;

    if (globalNS.boardState && cellIndex >= 0) {
      globalNS.boardState[cellIndex] = "O";
    }

    if (globalNS.gameMoves && cellIndex >= 0) {
      globalNS.gameMoves.push({
        player: "O",
        position: cellIndex,
        timestamp: new Date().toISOString(),
      });
    }
  }

  if (checkWinner()) {
    globalNS.scoreO++;
    loseSound.play();
    updateScoreDisplay();
    finishGame("O wins!");
    return;
  }

  if (checkDraw()) {
    globalNS.scoreDraw++;
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

  if (globalNS.boardState) {
    globalNS.boardState = Array(9).fill("");
  }
  if (globalNS.gameMoves) {
    globalNS.gameMoves = [];
  }

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

  // Reset timer
  resetTimer();
}
globalNS.restartGame = restartGame;

function resetScores() {
  globalNS.scoreX = 0;
  globalNS.scoreO = 0;
  updateScoreDisplay();

  if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
    localStorage.setItem("scoreResetTimestamp", new Date().toISOString());
  }
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
    saveScoreToFirestore,
    getGameLogic,
    initializeBoard,
    createCell,
    getElapsedTime,
    get gameMoves() {
      return globalNS.gameMoves;
    },
    set gameMoves(val) {
      globalNS.gameMoves = val;
    },
    get boardState() {
      return globalNS.boardState;
    },
    set boardState(val) {
      globalNS.boardState = val;
    },
    get scoreDraw() {
      return globalNS.scoreDraw;
    },
    set scoreDraw(val) {
      globalNS.scoreDraw = val;
    },
  };
}