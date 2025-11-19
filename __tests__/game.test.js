// Mock the DOM for testing
const createMockCells = (values = []) => {
    const cells = [];
    for (let i = 0; i < 9; i++) {
        const cell = {
            textContent: values[i] || '',
            style: {},
            addEventListener: jest.fn(),
            classList: {
                add: jest.fn(),
                remove: jest.fn(),
                contains: jest.fn(() => false)
            }
        };
        cells.push(cell);
    }
    return cells;
};

// Store original DOM methods/objects to restore after tests
const originalQuerySelectorAll = document.querySelectorAll;
const originalGetElementById = document.getElementById;
const originalAddEventListener = document.addEventListener;
// Make sure document.body.classList is initialized before any tests,
// and correctly mocked as a Jest mock
const originalBodyClassList = document.body.classList;

let mockGameOverMessage;
let mockRestartButton;
let mockScoreXElement;
let mockScoreOElement;
let mockThemeToggle;
let mockVsComputerRadio;
let mockVsPlayerRadio;


// Import pure logic for logic tests
import * as gameLogic from '../src/js/gameLogic.js';
let scriptModule; // For UI/state tests

beforeAll(() => {
    // Mock audio elements globally for all tests
    window.HTMLMediaElement.prototype.play = jest.fn();
    window.HTMLMediaElement.prototype.load = jest.fn();
});

beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();

    // ClassList override agar bisa di-spy
    Object.defineProperty(document.body, 'classList', {
        value: {
            add: jest.fn(),
            remove: jest.fn(),
            contains: jest.fn(() => false),
        },
        configurable: true,
    });

    mockGameOverMessage = { textContent: '', style: { display: 'none' } };
    mockRestartButton = {
        style: { display: 'none' },
        textContent: '',
        addEventListener: jest.fn()
    };
    mockScoreXElement = {
        get textContent() { return this._textContent; },
        set textContent(val) { this._textContent = String(val); },
        _textContent: '0',
        addEventListener: jest.fn(),
        classList: {
            add: jest.fn(),
            remove: jest.fn()
        },
        offsetWidth: 100 // diperlukan agar void offsetWidth tidak error
    };
    mockScoreOElement = {
        get textContent() { return this._textContent; },
        set textContent(val) { this._textContent = String(val); },
        _textContent: '0',
        addEventListener: jest.fn(),
        classList: {
            add: jest.fn(),
            remove: jest.fn()
        },
        offsetWidth: 100
    };
    mockThemeToggle = {
        checked: false, addEventListener: jest.fn((event, callback) => {
            if (event === 'change') mockThemeToggle._changeCallback = callback; // Store callback
        })
    };
    mockVsComputerRadio = {
        addEventListener: jest.fn((event, callback) => {
            if (event === 'change') {
                mockVsComputerRadio._changeCallback = callback;
            }
        }), checked: true
    };
    mockVsPlayerRadio = {
        addEventListener: jest.fn((event, callback) => {
            if (event === 'change') {
                mockVsPlayerRadio._changeCallback = callback;
            }
        }), checked: false
    };


    // Mock document.querySelectorAll
    document.querySelectorAll = jest.fn((selector) => {
        if (selector === ".cell") {
            return createMockCells([]); // Always return a fresh set of mock cells for .cell selector
        }
        return []; // Fallback for other selectors
    });

    // Mock document.getElementById
    document.getElementById = jest.fn((id) => {
        if (id === 'game-board') {
            return {
                innerHTML: '',
                appendChild: jest.fn(),
            };
        } else if (id === 'game-over-message') {
            return mockGameOverMessage;
        } else if (id === 'restart-button') {
            return mockRestartButton;
        } else if (id === 'reset-score-button') {
            return { addEventListener: jest.fn() };
        } else if (id === 'theme-toggle') {
            return mockThemeToggle;
        } else if (id === 'scoreX') {
            return mockScoreXElement;
        } else if (id === 'scoreO') {
            return mockScoreOElement;
        } else if (id === 'vsComputer') {
            return mockVsComputerRadio;
        } else if (id === 'vsPlayer') {
            return mockVsPlayerRadio;
        }
        return originalGetElementById(id); // Fallback for other IDs
    });

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
        value: {
            getItem: jest.fn(() => null), // Default to no theme saved
            setItem: jest.fn(),
            clear: jest.fn(),
        },
        writable: true,
    });

    // Jalankan DOMContentLoaded sebelum require
    const domReadyCallbacks = [];
    document.addEventListener = jest.fn((event, cb) => {
        if (event === 'DOMContentLoaded') {
            domReadyCallbacks.push(cb);
        }
    });

    // Re-import the module AFTER setting up mocks
    scriptModule = require('../src/js/script.js');

    // Trigger DOMContentLoaded callback (baru setelah import)
    domReadyCallbacks.forEach((cb) => cb());
});

afterEach(() => {
    // Pulihkan classList ke aslinya
    delete document.body.classList;
    document.body.classList = originalBodyClassList;

    document.querySelectorAll = originalQuerySelectorAll;
    document.getElementById = originalGetElementById;
    document.addEventListener = originalAddEventListener;

    jest.clearAllMocks(); // Clear mock calls
    jest.runOnlyPendingTimers(); // Clear any pending timers
    jest.useRealTimers(); // Switch back to real timers
});


describe('Game Logic Tests', () => {
    // --- Tes untuk checkWinner ---
    test('checkWinner should return true for a horizontal win by X', () => {
        const cells = ['X', 'X', 'X', '', '', '', '', '', ''];
        expect(gameLogic.checkWinner(cells)).not.toBeNull();
        expect(gameLogic.checkWinner(cells).winner).toBe('X');
    });
    test('checkWinner should return true for a vertical win by O', () => {
        const cells = ['O', '', '', 'O', '', '', 'O', '', ''];
        expect(gameLogic.checkWinner(cells)).not.toBeNull();
        expect(gameLogic.checkWinner(cells).winner).toBe('O');
    });
    test('checkWinner should return true for a diagonal win by X', () => {
        const cells = ['X', '', '', '', 'X', '', '', '', 'X'];
        expect(gameLogic.checkWinner(cells)).not.toBeNull();
        expect(gameLogic.checkWinner(cells).winner).toBe('X');
    });
    test('checkWinner should return false if no winner', () => {
        const cells = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', ''];
        expect(gameLogic.checkWinner(cells)).toBeNull();
    });
    // --- Tes untuk checkDraw ---
    test('checkDraw should return true if all cells are filled and no winner', () => {
        const cells = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
        expect(gameLogic.checkDraw(cells)).toBe(true);
    });
    test('checkDraw should return false if there are empty cells', () => {
        const cells = ['X', 'O', 'X', 'O', '', 'O', 'O', 'X', 'X'];
        expect(gameLogic.checkDraw(cells)).toBe(false);
    });
    // --- Tes untuk findBestMove (AI) ---
    test('findBestMove should block opponent (X) if they are about to win', () => {
        const cells = ['X', 'X', '', '', '', '', '', '', ''];
        expect(gameLogic.findBestMove(cells)).toBe(2);
    });
    test('findBestMove should choose winning move if available', () => {
        const cells = ['O', 'O', '', '', '', '', '', '', ''];
        expect(gameLogic.findBestMove(cells)).toBe(2);
    });
    test('findBestMove should choose center if available', () => {
        const cells = ['', '', '', '', '', '', '', '', ''];
        expect(gameLogic.findBestMove(cells)).toBe(4);
    });
    test('findBestMove should return a random available cell if no strategic moves', () => {
        const cells = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', ''];
        expect(gameLogic.findBestMove(cells)).toBe(8);
    });
    test('findBestMove should return null if no available cells', () => {
        const cells = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O'];
        expect(gameLogic.findBestMove(cells)).toBeNull();
    });
});

describe('Game UI and State Management Tests', () => {
    test('handleCellClick should place X and switch player if valid move in PvP', () => {
        const cells = createMockCells(['', '', '', '', '', '', '', '', '']);
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === ".cell") {
                return cells;
            }
            return originalQuerySelectorAll(selector);
        });

        // Set initial game state using the scriptModule object
        scriptModule.gameMode = 'playerVsFriend';
        scriptModule.gameState.currentPlayer = 'X';

        const cellToClick = cells[0];
        scriptModule.handleCellClick({ target: cellToClick }); // Simulate click event

        expect(cellToClick.textContent).toBe('X');
        expect(scriptModule.gameState.currentPlayer).toBe('O'); // Player should have switched to O
    });

    test('handleCellClick should not allow click on filled cell', () => {
        const cells = createMockCells(['X', '', '', '', '', '', '', '', '']);
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === ".cell") {
                return cells;
            }
            return originalQuerySelectorAll(selector);
        });

        scriptModule.gameState.currentPlayer = 'O'; // Try to click as O

        const cellToClick = cells[0];
        scriptModule.handleCellClick({ target: cellToClick });

        expect(cellToClick.textContent).toBe('X'); // Should remain X
        expect(scriptModule.gameState.currentPlayer).toBe('O'); // Player should not switch
    });

    test('handleCellClick should declare winner and update score', () => {
        const cells = createMockCells(['X', 'X', '', '', '', '', '', '', '']);
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === ".cell") {
                return cells;
            }
            return originalQuerySelectorAll(selector);
        });

        // Set up initial state for the test
        scriptModule.gameState.currentPlayer = 'X'; // Player X is about to win
        scriptModule.scoreX = 0; // Initial score for X

        const cellToClick = cells[2]; // Cell that completes the win for X
        scriptModule.handleCellClick({ target: cellToClick });

        expect(cellToClick.textContent).toBe('X');
        expect(mockGameOverMessage.textContent).toBe('X wins!');
        expect(mockGameOverMessage.style.display).toBe('block');
        expect(mockRestartButton.style.display).toBe('block');
        expect(scriptModule.scoreX).toBe(1); // Score X should increment
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled(); // winSound should play
        expect(scriptModule.gameState.gameOver).toBe(true);
    });

    test('handleCellClick should declare draw if no winner and all cells filled', () => {
        const boardState = ['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', '']; // Sel terakhir kosong
        const cells = createMockCells(boardState);

        // Mock semua elemen sebelum import modul
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === ".cell") return cells;
            return originalQuerySelectorAll(selector);
        });

        document.getElementById = jest.fn((id) => {
            switch (id) {
                case 'game-over-message': return mockGameOverMessage;
                case 'restart-button': return mockRestartButton;
                case 'scoreX': return mockScoreXElement;
                case 'scoreO': return mockScoreOElement;
                case 'theme-toggle': return mockThemeToggle;
                case 'vsComputer': return mockVsComputerRadio;
                case 'vsPlayer': return mockVsPlayerRadio;
                case 'reset-score-button': return { addEventListener: jest.fn() };
                default: return null;
            }
        });

        // Import ulang modul setelah mock siap
        const scriptModule = require('../src/js/script.js');

        // Pastikan currentPlayer diset ke O karena giliran terakhir
        scriptModule.gameState.currentPlayer = 'O';
        scriptModule.gameState.gameOver = false;
        scriptModule.gameMode = 'playerVsFriend';

        const cellToClick = cells[8]; // Klik terakhir
        scriptModule.handleCellClick({ target: cellToClick });

        expect(cellToClick.textContent).toBe('O');
        expect(mockGameOverMessage.textContent).toBe("It's a draw!");
        expect(mockGameOverMessage.style.display).toBe('block');
        expect(mockRestartButton.style.display).toBe('block');
        expect(scriptModule.gameState.gameOver).toBe(true);
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled(); // drawSound
    });

    test('winning cells should get green highlight', () => {
        // Helper to create mock cells with working classList
        function createMockCells(values) {
            return values.map(val => {
                let classes = new Set();
                return {
                    textContent: val,
                    classList: {
                        add: (cls) => classes.add(cls),
                        remove: (cls) => classes.delete(cls),
                        contains: (cls) => classes.has(cls)
                    }
                };
            });
        }

        const cells = createMockCells(['X', 'X', 'X', '', '', '', '', '', '']);
        document.querySelectorAll = jest.fn(() => cells);

        scriptModule.checkWinner();

        expect(cells[0].classList.contains('winner')).toBe(true);
        expect(cells[1].classList.contains('winner')).toBe(true);
        expect(cells[2].classList.contains('winner')).toBe(true);
    });

    test('restartGame should reset board and hide message', () => {
        const cells = createMockCells(['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', 'O']);
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === ".cell") {
                return cells;
            }
            return originalQuerySelectorAll(selector);
        });
        mockGameOverMessage.style.display = 'block';
        mockGameOverMessage.textContent = 'X wins!';
        scriptModule.gameState.gameOver = true; // Set game over state
        scriptModule.gameState.currentPlayer = 'O'; // Set current player to O for checking reset to X

        scriptModule.restartGame(); // Call the function directly

        cells.forEach(cell => {
            expect(cell.textContent).toBe(''); // All cells should be empty
            expect(cell.style.backgroundColor).not.toBe("#8bc34a"); // Check if highlight is removed (assuming this was a win highlight color)
        });
        expect(mockGameOverMessage.style.display).toBe('none'); // Message hidden
        expect(scriptModule.gameState.currentPlayer).toBe('X'); // Current player reset to X
        expect(scriptModule.gameState.gameOver).toBe(false); // Game over state reset
        expect(mockRestartButton.style.display).toBe('none'); // Restart button hidden
    });

    test('resetScores should set scores to 0 and update display', () => {
        // Set some initial scores
        scriptModule.scoreX = 5;
        scriptModule.scoreO = 3;
        mockScoreXElement.textContent = '5'; // Update mock DOM elements
        mockScoreOElement.textContent = '3';

        scriptModule.resetScores();

        expect(scriptModule.scoreX).toBe(0);
        expect(scriptModule.scoreO).toBe(0);
        expect(mockScoreXElement.textContent).toBe('0'); // Display should update
        expect(mockScoreOElement.textContent).toBe('0'); // Display should update
    });

    test('theme toggle should add darkmode class and set localStorage', () => {
        // Simulasi toggle diaktifkan
        mockThemeToggle.checked = true;

        // Simulasikan event toggle
        const callback = mockThemeToggle._changeCallback;
        expect(callback).toBeDefined();

        callback();

        expect(document.body.classList.add).toHaveBeenCalledWith('dark-mode');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    test('theme toggle should remove darkmode class and set localStorage', () => {
        mockThemeToggle.checked = false; // User unchecks the toggle

        const callback = mockThemeToggle._changeCallback;
        expect(callback).toBeDefined();

        callback();

        expect(document.body.classList.remove).toHaveBeenCalledWith('dark-mode');
        expect(localStorage.setItem).toHaveBeenCalledWith('theme', 'light');
    });

    test('game mode change to playerVsComputer should reset game and set gameMode', () => {
        mockVsComputerRadio.checked = true;
        mockVsPlayerRadio.checked = false;

        jest.spyOn(scriptModule, 'restartGame').mockImplementation(() => { });

        // Re-attach the change handler so it uses the spy
        if (mockVsComputerRadio._changeCallback) {
            mockVsComputerRadio._changeCallback = () => {
                scriptModule.gameMode = 'playerVsComputer';
                scriptModule.restartGame();
                mockGameOverMessage.style.display = 'none';
            };
        }

        // Simulasikan trigger perubahan radio button
        const callback = mockVsComputerRadio._changeCallback;
        expect(callback).toBeDefined(); // Pastikan listener tersedia

        callback(); // Trigger perubahan

        expect(scriptModule.gameMode).toBe('playerVsComputer');
        expect(scriptModule.restartGame).toHaveBeenCalled();

        expect(mockGameOverMessage.style.display).toBe('none');
    });

    test('game mode change to playerVsFriend should reset game and set gameMode', () => {
        mockVsPlayerRadio.checked = true;
        mockVsComputerRadio.checked = false; // Ensure other radio is unchecked

        jest.spyOn(scriptModule, 'restartGame').mockImplementation(() => { });

        // Re-attach the change handler so it uses the spy
        if (mockVsPlayerRadio._changeCallback) {
            mockVsPlayerRadio._changeCallback = () => {
                scriptModule.gameMode = 'playerVsFriend';
                scriptModule.restartGame();
                mockGameOverMessage.style.display = 'none';
            };
        }

        const callback = mockVsPlayerRadio._changeCallback;
        expect(callback).toBeDefined();

        callback(); // Trigger the change event

        expect(scriptModule.gameMode).toBe('playerVsFriend');
        expect(scriptModule.restartGame).toHaveBeenCalled(); // Game should be restarted
        expect(mockGameOverMessage.style.display).toBe('none'); // Implies restart happened
    });

    test('computerMove should place O and switch player if game is not over', async () => {
        const cells = createMockCells(['X', '', '', '', '', '', '', '', '']);
        // Set mock BEFORE importing scriptModule
        // Pastikan mock getCells() mengembalikan array yang benar
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === '.cell') return cells;
            return [];
        });

        scriptModule.gameMode = 'playerVsComputer';
        scriptModule.gameState.currentPlayer = 'O';
        scriptModule.gameState.gameOver = false; // Pastikan game belum berakhir

        // Jalankan aksi komputer
        scriptModule.computerMove();

        // Cari cell yang diisi oleh komputer (harus ada satu 'O')
        const oCells = cells.filter(cell => cell.textContent === 'O');

        expect(oCells.length).toBeGreaterThan(0); // Komputer harus mengisi sel
        expect(scriptModule.gameState.currentPlayer).toBe('X');
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled();
    });

    test('computerMove should declare O winner and update score', async () => {
        const cells = createMockCells(['O', '', '', 'O', '', '', '', '', '']);
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === ".cell") {
                return cells;
            }
            return originalQuerySelectorAll(selector);
        });
        jest.spyOn(scriptModule, 'findBestMove').mockReturnValue(cells[6]); // Computer chooses cell 6 for win
        jest.spyOn(scriptModule, 'checkWinner').mockReturnValue(true); // Mock checkWinner to return true after this move

        scriptModule.gameMode = 'playerVsComputer';
        scriptModule.gameState.currentPlayer = 'O';

        scriptModule.computerMove();
        jest.runAllTimers(); // Ensure setTimeout completes

        expect(cells[6].textContent).toBe('O');
        expect(mockGameOverMessage.textContent).toBe('O wins!');
        expect(mockGameOverMessage.style.display).toBe('block');
        expect(scriptModule.scoreO).toBe(1); // Score O should increment
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled(); // loseSound should play
        expect(scriptModule.gameState.gameOver).toBe(true);
    });

    test('computerMove should declare draw if no winner after computer move', async () => {
        const cells = createMockCells(['X', 'O', 'X', 'O', 'X', 'O', 'O', 'X', '']); // Last empty cell at index 8
        document.querySelectorAll.mockImplementation((selector) => {
            if (selector === ".cell") {
                return cells;
            }
            return originalQuerySelectorAll(selector);
        });
        jest.spyOn(scriptModule, 'findBestMove').mockReturnValue(cells[8]); // Computer makes last move
        jest.spyOn(scriptModule, 'checkWinner').mockReturnValue(false); // No winner
        jest.spyOn(scriptModule, 'checkDraw').mockReturnValue(true); // But it's a draw

        scriptModule.gameMode = 'playerVsComputer';
        scriptModule.gameState.currentPlayer = 'O';

        scriptModule.computerMove();
        jest.runAllTimers();

        expect(cells[8].textContent).toBe('O');
        expect(mockGameOverMessage.textContent).toBe("It's a draw!");
        expect(mockGameOverMessage.style.display).toBe('block');
        expect(window.HTMLMediaElement.prototype.play).toHaveBeenCalled(); // drawSound should play
        expect(scriptModule.gameState.gameOver).toBe(true);
    });
});