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

function findBestMove(cells, player = "O", opponent = "X") {
  const availableMoves = cells
    .map((cell, idx) => (cell === "" ? idx : null))
    .filter((idx) => idx !== null);
  if (availableMoves.length === 0) return null;

  // Try to win
  for (const move of availableMoves) {
    const temp = [...cells];
    temp[move] = player;
    if (checkWinner(temp)) return move;
  }
  // Block opponent
  for (const move of availableMoves) {
    const temp = [...cells];
    temp[move] = opponent;
    if (checkWinner(temp)) return move;
  }
  // Center
  if (cells[4] === "") return 4;
  // Corners
  const corners = [0, 2, 6, 8];
  const availableCorners = corners.filter((i) => cells[i] === "");
  if (availableCorners.length > 0)
    return availableCorners[
      Math.floor(Math.random() * availableCorners.length)
    ];
  // Edges
  const edges = [1, 3, 5, 7];
  const availableEdges = edges.filter((i) => cells[i] === "");
  if (availableEdges.length > 0)
    return availableEdges[Math.floor(Math.random() * availableEdges.length)];
  // Random
  return availableMoves[Math.floor(Math.random() * availableMoves.length)];
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
