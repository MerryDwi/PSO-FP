// Export for Jest/node testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        gameState: window.gameState,
        scoreX: window.scoreX,
        scoreO: window.scoreO,
        gameMode: window.gameMode,
        getCells,
        checkWinner,
        checkDraw,
        findBestMove,
        handleCellClick,
        computerMove,
        restartGame,
        resetScores,
        updateScoreDisplay
    };
}
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

// Import logic (for browser, use <script type="module"> or bundle, for static fallback, use window.gameLogic)
let checkWinnerLogic, checkDrawLogic, findBestMoveLogic;
if (window.gameLogic) {
    checkWinnerLogic = window.gameLogic.checkWinner;
    checkDrawLogic = window.gameLogic.checkDraw;
    findBestMoveLogic = window.gameLogic.findBestMove;
}

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
    const cellValues = cells.map(cell => cell.textContent);
    const result = checkWinnerLogic ? checkWinnerLogic(cellValues) : null;
    if (result) {
        const [a, b, c] = result.combo;
        highlightWinner(cells[a], cells[b], cells[c]);
        return true;
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
    const cells = getCells();
    const cellValues = cells.map(cell => cell.textContent);
    return checkDrawLogic ? checkDrawLogic(cellValues) : cells.every(cell => cell.textContent !== "");
}
window.checkDraw = checkDraw;

function findBestMove() {
    const currentCells = getCells();
    const cellValues = currentCells.map(cell => cell.textContent);
    const idx = findBestMoveLogic ? findBestMoveLogic(cellValues) : null;
    if (idx === null || idx === undefined) return null;
    return currentCells[idx];
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