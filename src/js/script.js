// Agar fungsi bisa dipanggil dari HTML onclick
window.restartGame = restartGame;
window.resetScores = resetScores;
export const gameState = {
    currentPlayer: "X",
    gameOver: false
};

window.scoreX = 0;
window.scoreO = 0;
window.gameMode = 'playerVsComputer';

// Variabel DOM
const board = document.getElementById("game-board");
const gameOverMessage = document.getElementById("game-over-message");
const restartButton = document.getElementById("restart-button");
const scoreXElement = document.getElementById("scoreX");
const scoreOElement = document.getElementById("scoreO");
const themeToggle = document.getElementById("theme-toggle");
const vsComputerRadio = document.getElementById("vsComputer");
const vsPlayerRadio = document.getElementById("vsPlayer");
const resetButton = document.getElementById("reset-score-button");

// Suara
const winSound = new Audio("./src/sounds/win.mp3");
const loseSound = new Audio("./src/sounds/lose.mp3");
const drawSound = new Audio("./src/sounds/draw.mp3");

// Buat dan inisialisasi papan
function initializeBoard() {
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        board.appendChild(createCell());
    }
    updateScoreDisplay();
}

// Membuat cell dan tambahkan event listener
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

function checkWinner() {
    const cells = getCells();
    const winCombinations = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8],
        [0, 3, 6], [1, 4, 7], [2, 5, 8],
        [0, 4, 8], [2, 4, 6]
    ];

    for (const combo of winCombinations) {
        const [a, b, c] = combo;
        if (cells[a].textContent &&
            cells[a].textContent === cells[b].textContent &&
            cells[b].textContent === cells[c].textContent) {
            highlightWinner(cells[a], cells[b], cells[c]);
            return true;
        }
    }
    return false;
}
window.checkWinner = checkWinner;

function highlightWinner(cellA, cellB, cellC) {
    cellA.classList.add('winner');
    cellB.classList.add('winner');
    cellC.classList.add('winner');
}

function checkDraw() {
    return getCells().every(cell => cell.textContent !== "");
}
window.checkDraw = checkDraw;

function findBestMove() {
    const currentCells = getCells();
    const availableMoves = currentCells.map((cell, index) => cell.textContent === "" ? index : null).filter(index => index !== null);

    const checkWinnerForMinimax = (board, player) => {
        const winCombinations = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8],
            [0, 3, 6], [1, 4, 7], [2, 5, 8],
            [0, 4, 8], [2, 4, 6]
        ];
        return winCombinations.some(([a, b, c]) => board[a] === player && board[b] === player && board[c] === player);
    };

    if (availableMoves.length === 0) return null;

    for (const move of availableMoves) {
        const temp = currentCells.map(c => c.textContent);
        temp[move] = 'O';
        if (checkWinnerForMinimax(temp, 'O')) return currentCells[move];
    }

    for (const move of availableMoves) {
        const temp = currentCells.map(c => c.textContent);
        temp[move] = 'X';
        if (checkWinnerForMinimax(temp, 'X')) return currentCells[move];
    }

    if (currentCells[4].textContent === "") return currentCells[4];

    const corners = [0, 2, 6, 8];
    const availableCorners = corners.filter(i => currentCells[i].textContent === "");
    if (availableCorners.length > 0) return currentCells[availableCorners[Math.floor(Math.random() * availableCorners.length)]];

    const edges = [1, 3, 5, 7];
    const availableEdges = edges.filter(i => currentCells[i].textContent === "");
    if (availableEdges.length > 0) return currentCells[availableEdges[Math.floor(Math.random() * availableEdges.length)]];

    return currentCells[availableMoves[Math.floor(Math.random() * availableMoves.length)]];
}
window.findBestMove = findBestMove;

function updateScoreDisplay(prevX = window.scoreX, prevO = window.scoreO) {
    if (scoreXElement && scoreOElement) {
        scoreXElement.textContent = window.scoreX;
        scoreOElement.textContent = window.scoreO;

        if (window.scoreX > prevX) {
            scoreXElement.classList.remove('score-animate');
            void scoreXElement.offsetWidth;
            scoreXElement.classList.add('score-animate');
        }
        if (window.scoreO > prevO) {
            scoreOElement.classList.remove('score-animate');
            void scoreOElement.offsetWidth;
            scoreOElement.classList.add('score-animate');
        }
    }
}
window.updateScoreDisplay = updateScoreDisplay;

scoreXElement?.addEventListener('animationend', () => {
    scoreXElement.classList.remove('score-animate');
});
scoreOElement?.addEventListener('animationend', () => {
    scoreOElement.classList.remove('score-animate');
});

function handleCellClick(event) {
    const clickedCell = event.target;
    if (clickedCell.textContent === "" && !window.gameState.gameOver) {
        clickedCell.textContent = window.gameState.currentPlayer;
        // moveSound dihapus

        if (checkWinner()) {
            gameOverMessage.textContent = `${window.gameState.currentPlayer} wins!`;
            gameOverMessage.style.display = "block";
            window.gameState.gameOver = true;
            restartButton.style.display = "block";

            if (window.gameState.currentPlayer === "X") {
                const prev = window.scoreX;
                window.scoreX++;
                winSound.currentTime = 0;
                winSound.play();
                updateScoreDisplay(prev, window.scoreO);
            } else {
                const prev = window.scoreO;
                window.scoreO++;

                if (window.gameMode === 'playerVsComputer') {
                    loseSound.currentTime = 0;
                    loseSound.play(); // O adalah komputer
                } else {
                    winSound.currentTime = 0;
                    winSound.play(); // O adalah player, jadi play winSound juga
                }

                updateScoreDisplay(window.scoreX, prev);
            }
        } else if (checkDraw()) {
            gameOverMessage.textContent = "It's a draw!";
            gameOverMessage.style.display = "block";
            window.gameState.gameOver = true;
            restartButton.style.display = "block";
            drawSound.play();
        } else {
            window.gameState.currentPlayer = window.gameState.currentPlayer === "X" ? "O" : "X";
            if (window.gameMode === 'playerVsComputer' && window.gameState.currentPlayer === 'O' && !window.gameState.gameOver) {
                setTimeout(computerMove, 500);
            }
        }
    }
}
window.handleCellClick = handleCellClick;

function computerMove() {
    if (window.gameState.gameOver) return;
    const bestMoveCell = findBestMove();

    if (bestMoveCell) {
        bestMoveCell.textContent = 'O';
        // moveSound dihapus

        if (checkWinner()) {
            gameOverMessage.textContent = "O wins!";
            gameOverMessage.style.display = "block";
            window.gameState.gameOver = true;
            restartButton.style.display = "block";
            const prev = window.scoreO;
            window.scoreO++;
            loseSound.play();
            updateScoreDisplay(window.scoreX, prev);
        } else if (checkDraw()) {
            gameOverMessage.textContent = "It's a draw!";
            gameOverMessage.style.display = "block";
            window.gameState.gameOver = true;
            restartButton.style.display = "block";
            drawSound.play();
        } else {
            window.gameState.currentPlayer = "X";
        }
    }
}
window.computerMove = computerMove;

function restartGame() {
    window.gameState.currentPlayer = "X";
    window.gameState.gameOver = false;
    gameOverMessage.style.display = "none";

    const cells = getCells();
    const isDark = document.body.classList.contains('dark-mode');
    cells.forEach(cell => {
        cell.textContent = "";
        cell.classList.remove('winner');
        cell.style.transform = "scale(1)";
        cell.style.transition = "";
    });
}
window.restartGame = restartGame;

function resetScores() {
    window.scoreX = 0;
    window.scoreO = 0;
    updateScoreDisplay();
    restartGame();
}
window.resetScores = resetScores;

document.addEventListener("DOMContentLoaded", () => {
    initializeBoard();

    if (restartButton) restartButton.addEventListener("click", restartGame);
    if (resetButton) resetButton.addEventListener("click", resetScores);

    getCells().forEach(cell => {
        cell.addEventListener("click", handleCellClick);
    });

    if (themeToggle) {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
            themeToggle.checked = true;
        }
        themeToggle.addEventListener('change', () => {
            if (themeToggle.checked) {
                document.body.classList.add('dark-mode');
                localStorage.setItem('theme', 'dark');
            } else {
                document.body.classList.remove('dark-mode');
                localStorage.setItem('theme', 'light');
            }
            restartGame(); // perbarui gaya cell
        });
    }

    if (vsComputerRadio) {
        vsComputerRadio.addEventListener('change', () => {
            window.gameMode = 'playerVsComputer';
            resetScores();
        });
    }

    if (vsPlayerRadio) {
        vsPlayerRadio.addEventListener('change', () => {
            window.gameMode = 'playerVsFriend';
            resetScores();
        });
    }

    updateScoreDisplay();
});