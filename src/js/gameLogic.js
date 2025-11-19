// gameLogic.js
// Pure logic for Tic Tac Toe, exportable for both Jest and browser usage

// Check winner on a 1D array of 9 cells (['X', '', ...])
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

// Minimax algorithm untuk membuat komputer lebih sulit (unbeatable)
function minimax(cells, depth, isMaximizing, player = "O", opponent = "X") {
  const winner = checkWinner(cells);
  if (winner) {
    return winner.winner === player ? 10 - depth : depth - 10;
  }
  if (checkDraw(cells)) {
    return 0;
  }

  if (isMaximizing) {
    let bestScore = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (cells[i] === "") {
        cells[i] = player;
        const score = minimax(cells, depth + 1, false, player, opponent);
        cells[i] = "";
        bestScore = Math.max(score, bestScore);
      }
    }
    return bestScore;
  } else {
    let bestScore = Infinity;
    for (let i = 0; i < 9; i++) {
      if (cells[i] === "") {
        cells[i] = opponent;
        const score = minimax(cells, depth + 1, true, player, opponent);
        cells[i] = "";
        bestScore = Math.min(score, bestScore);
      }
    }
    return bestScore;
  }
}

function findBestMove(cells, player = "O", opponent = "X") {
  const availableMoves = cells
    .map((cell, idx) => (cell === "" ? idx : null))
    .filter((idx) => idx !== null);
  if (availableMoves.length === 0) return null;

  // Prioritas urutan langkah (untuk tie-breaking saat semua move sama baiknya)
  const movePriority = [4, 0, 2, 6, 8, 1, 3, 5, 7]; // Center, corners, edges

  let bestScore = -Infinity;
  let bestMoves = []; // Simpan semua move dengan score tertinggi

  for (const move of availableMoves) {
    const temp = [...cells];
    temp[move] = player;
    const score = minimax(temp, 0, false, player, opponent);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  }

  // Jika ada beberapa move dengan score sama, pilih yang punya prioritas tertinggi
  if (bestMoves.length > 1) {
    for (const priority of movePriority) {
      if (bestMoves.includes(priority)) {
        return priority;
      }
    }
  }

  return bestMoves[0];
}

// Untuk penggunaan di browser tanpa import/export
if (typeof window !== "undefined") {
  window.gameLogic = {
    checkWinner,
    checkDraw,
    findBestMove,
  };
}

// Export untuk Jest/node testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    checkWinner,
    checkDraw,
    findBestMove,
  };
}
