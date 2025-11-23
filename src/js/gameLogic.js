// ===============================
// PURE GAME LOGIC (SAFE FOR BROWSER & JEST)
// ===============================

// Check winner on a 1D array of 9 strings ["X", "", ..., "O"]
function checkWinner(cells) {
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

  for (const combo of winCombinations) {
    const [a, b, c] = combo;
    if (cells[a] && cells[a] === cells[b] && cells[b] === cells[c]) {
      return { winner: cells[a], combo };
    }
  }
  return null;
}

function checkDraw(cells) {
  return cells.every((cell) => cell !== "");
}

// ===============================
// Minimax AI Algorithm (Unbeatable AI)
// ===============================
function minimax(cells, depth, isMaximizing, player = "O", opponent = "X") {
  const win = checkWinner(cells);
  if (win) {
    return win.winner === player ? 10 - depth : depth - 10;
  }
  if (checkDraw(cells)) {
    return 0;
  }

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (cells[i] === "") {
        cells[i] = player;
        const score = minimax(cells, depth + 1, false, player, opponent);
        cells[i] = "";
        best = Math.max(best, score);
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (cells[i] === "") {
        cells[i] = opponent;
        const score = minimax(cells, depth + 1, true, player, opponent);
        cells[i] = "";
        best = Math.min(best, score);
      }
    }
    return best;
  }
}

function findBestMove(cells, player = "O", opponent = "X") {
  const availableMoves = cells
    .map((v, i) => (v === "" ? i : null))
    .filter((i) => i !== null);

  if (availableMoves.length === 0) return null;

  // Preferred move order when scores are tied:
  const priority = [4, 0, 2, 6, 8, 1, 3, 5, 7];

  let bestScore = -Infinity;
  let bestMoves = [];

  for (const move of availableMoves) {
    const cloned = [...cells];
    cloned[move] = player;
    const score = minimax(cloned, 0, false, player, opponent);

    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // If multiple moves have same score, choose based on priority
  if (bestMoves.length > 1) {
    for (const p of priority) {
      if (bestMoves.includes(p)) return p;
    }
  }

  return bestMoves[0];
}

// ===============================
// EXPORTS FOR BROWSER + NODE/JEST
// ===============================

// Browser (no module system)
if (typeof window !== "undefined") {
  window.gameLogic = {
    checkWinner,
    checkDraw,
    findBestMove,
  };
}

// Node / Jest testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    checkWinner,
    checkDraw,
    findBestMove,
  };
}
