// ===============================
// CONTOH PENGGUNAAN FIRESTORE CRUD OPERATIONS
// ===============================
// File ini berisi contoh penggunaan fungsi-fungsi CRUD dari firestoreCRUD.js

import {
  // Leaderboard
  addScoreToLeaderboard,
  getLeaderboard,
  getScoreById,
  getUserScores,
  updateScoreResult,
  updateScoreGameTime,
  deleteScore,

  // Game History
  addGameHistory,
  getGameHistoryById,
  getUserGameHistory,
  getGameHistoryByGameId,
  addMoveToHistory,
  updateHistoryBoardState,
  deleteGameHistory,

  // User Preferences
  saveUserPreferences,
  getUserPreferences,
  updateUserTheme,
  updateUserGameMode,
  deleteUserPreferences,

  // User Statistics
  saveUserStatistics,
  getUserStatistics,
  incrementTotalGames,
  incrementWins,
  updateBestTime,
  deleteUserStatistics,

  // Sessions
  addSessionData,
  getSessionById,
  getUserSessions,
  closeSession,
  incrementSessionGames,
  deleteSession,

  // Advanced
  saveGameDataWithHistory,
  updateStatisticsAtomically,
} from "./firestoreCRUD.js";

// ===============================
// CONTOH: LEADERBOARD OPERATIONS
// ===============================

// 1. Menambahkan score baru
async function contohAddScore() {
  const scoreId = await addScoreToLeaderboard(2, 1, 45, "win", {
    gameMode: "playerVsComputer",
  });
  console.log("Score ID:", scoreId);
}

// 2. Membaca leaderboard
async function contohGetLeaderboard() {
  const leaderboard = await getLeaderboard(10);
  console.log("Top 10 Leaderboard:", leaderboard);
}

// 3. Membaca score berdasarkan ID
async function contohGetScoreById() {
  const score = await getScoreById("some-score-id");
  console.log("Score:", score);
}

// 4. Membaca semua score user
async function contohGetUserScores() {
  const scores = await getUserScores(); // Current user
  // atau
  // const scores = await getUserScores("user-id-here");
  console.log("User scores:", scores);
}

// 5. Update score result
async function contohUpdateScore() {
  await updateScoreResult("score-id", "win");
  await updateScoreGameTime("score-id", 60);
}

// 6. Hapus score
async function contohDeleteScore() {
  await deleteScore("score-id");
}

// ===============================
// CONTOH: GAME HISTORY OPERATIONS
// ===============================

// 1. Menambahkan game history
async function contohAddHistory() {
  const moves = [
    { player: "X", position: 0, timestamp: new Date().toISOString() },
    { player: "O", position: 4, timestamp: new Date().toISOString() },
    { player: "X", position: 1, timestamp: new Date().toISOString() },
  ];
  const boardState = ["X", "X", "", "", "O", "", "", "", ""];
  const gameId = "leaderboard-doc-id";

  const historyId = await addGameHistory(moves, boardState, gameId);
  console.log("History ID:", historyId);
}

// 2. Membaca game history
async function contohGetHistory() {
  // By ID
  const history = await getGameHistoryById("history-id");

  // By gameId
  const gameHistory = await getGameHistoryByGameId("leaderboard-doc-id");

  // All user history
  const userHistory = await getUserGameHistory();
}

// 3. Update history
async function contohUpdateHistory() {
  const newMove = {
    player: "O",
    position: 2,
    timestamp: new Date().toISOString(),
  };
  await addMoveToHistory("history-id", newMove);

  const newBoardState = ["X", "X", "O", "", "O", "", "", "", ""];
  await updateHistoryBoardState("history-id", newBoardState);
}

// 4. Hapus history
async function contohDeleteHistory() {
  await deleteGameHistory("history-id");
}

// ===============================
// CONTOH: USER PREFERENCES OPERATIONS
// ===============================

// 1. Simpan preferences
async function contohSavePreferences() {
  await saveUserPreferences({
    theme: "dark",
    gameMode: "playerVsComputer",
  });
}

// 2. Baca preferences
async function contohGetPreferences() {
  const prefs = await getUserPreferences();
  console.log("User preferences:", prefs);
}

// 3. Update preferences
async function contohUpdatePreferences() {
  await updateUserTheme("dark");
  await updateUserGameMode("playerVsFriend");
}

// 4. Hapus preferences
async function contohDeletePreferences() {
  await deleteUserPreferences();
}

// ===============================
// CONTOH: USER STATISTICS OPERATIONS
// ===============================

// 1. Simpan statistics
async function contohSaveStatistics() {
  await saveUserStatistics({
    totalGames: 10,
    totalWins: 5,
    totalDraws: 2,
    totalLosses: 3,
    bestTime: 30,
    averageGameTime: 45,
  });
}

// 2. Baca statistics
async function contohGetStatistics() {
  const stats = await getUserStatistics();
  console.log("User statistics:", stats);
}

// 3. Update statistics dengan increment
async function contohUpdateStatistics() {
  await incrementTotalGames();
  await incrementWins();
  await updateBestTime(25);
}

// 4. Hapus statistics
async function contohDeleteStatistics() {
  await deleteUserStatistics();
}

// ===============================
// CONTOH: SESSIONS OPERATIONS
// ===============================

// 1. Tambah session
async function contohAddSession() {
  const sessionId = await addSessionData({
    startTime: new Date(),
    endTime: null,
    totalGames: 0,
    totalTime: 0,
  });
  console.log("Session ID:", sessionId);
}

// 2. Baca session
async function contohGetSession() {
  // By ID
  const session = await getSessionById("session-id");

  // All user sessions
  const sessions = await getUserSessions();
}

// 3. Update session
async function contohUpdateSession() {
  await closeSession("session-id", new Date());
  await incrementSessionGames("session-id");
}

// 4. Hapus session
async function contohDeleteSession() {
  await deleteSession("session-id");
}

// ===============================
// CONTOH: ADVANCED OPERATIONS
// ===============================

// 1. Batched Write - Simpan score dan history bersamaan
async function contohBatchedWrite() {
  const scoreData = {
    userId: "user-id",
    userEmail: "user@example.com",
    humanScore: 2,
    computerScore: 1,
    gameTime: 45,
    result: "win",
    gameMode: "playerVsComputer",
  };

  const historyData = {
    userId: "user-id",
    userEmail: "user@example.com",
    moves: [
      { player: "X", position: 0, timestamp: new Date().toISOString() },
    ],
    boardState: ["X", "", "", "", "", "", "", "", ""],
    moveCount: 1,
  };

  await saveGameDataWithHistory(scoreData, historyData);
}

// 2. Transaction - Update statistics secara atomik
async function contohTransaction() {
  const userId = "user-id";
  await updateStatisticsAtomically(userId, "win");
}

// ===============================
// CONTOH: WORKFLOW LENGKAP
// ===============================

/**
 * Contoh workflow lengkap: Game selesai -> Simpan semua data
 */
async function contohWorkflowLengkap() {
  try {
    // 1. Simpan score ke leaderboard
    const scoreId = await addScoreToLeaderboard(2, 1, 45, "win");

    // 2. Simpan game history
    const moves = [
      { player: "X", position: 0, timestamp: new Date().toISOString() },
      { player: "O", position: 4, timestamp: new Date().toISOString() },
      { player: "X", position: 1, timestamp: new Date().toISOString() },
    ];
    const boardState = ["X", "X", "", "", "O", "", "", "", ""];
    await addGameHistory(moves, boardState, scoreId);

    // 3. Update user statistics
    await incrementTotalGames();
    await incrementWins();
    await updateBestTime(45);

    // 4. Update session (jika ada)
    // await incrementSessionGames("session-id");

    console.log("Semua data berhasil disimpan!");
  } catch (error) {
    console.error("Error dalam workflow:", error);
  }
}

// Export contoh-contoh untuk testing
export {
  contohAddScore,
  contohGetLeaderboard,
  contohAddHistory,
  contohSavePreferences,
  contohSaveStatistics,
  contohAddSession,
  contohBatchedWrite,
  contohTransaction,
  contohWorkflowLengkap,
};

