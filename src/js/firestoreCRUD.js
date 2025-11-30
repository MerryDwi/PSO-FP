// ===============================
// FIRESTORE CRUD OPERATIONS
// ===============================
// Implementasi lengkap CRUD operations untuk Firestore
// Berdasarkan konfigurasi dari firebase.config.js

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  deleteField,
  writeBatch,
  runTransaction,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { firebaseConfig } from "./firebase.config.js";

// Initialize Firebase (gunakan existing app jika sudah ada)
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// ===============================
// 1. LEADERBOARD COLLECTION
// ===============================

/**
 * CREATE - Menambahkan score baru ke leaderboard
 * @param {number} humanScore - Score player (X)
 * @param {number} computerScore - Score computer (O)
 * @param {number} gameTime - Waktu permainan dalam detik
 * @param {string} result - Hasil game: 'win', 'lose', atau 'draw'
 * @param {Object} additionalData - Data tambahan (optional)
 * @returns {Promise<string|null>} ID dokumen yang disimpan atau null jika error
 */
export async function addScoreToLeaderboard(
  humanScore,
  computerScore,
  gameTime,
  result,
  additionalData = {}
) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, score tidak disimpan");
      return null;
    }

    // Ambil reset timestamp dari localStorage (jika ada)
    let resetTimestampISO = null;
    if (typeof localStorage !== "undefined") {
      resetTimestampISO = localStorage.getItem("scoreResetTimestamp");
      if (!resetTimestampISO) {
        resetTimestampISO = new Date().toISOString();
        localStorage.setItem("scoreResetTimestamp", resetTimestampISO);
      }
    }

    const scoreData = {
      userId: user.uid,
      userEmail: user.email,
      humanScore: humanScore,
      computerScore: computerScore,
      gameTime: gameTime,
      result: result, // 'win', 'lose', atau 'draw'
      timestamp: serverTimestamp(),
      gameMode: additionalData.gameMode || "playerVsComputer",
      resetTimestampISO: resetTimestampISO,
      currentScores: {
        scoreX: humanScore,
        scoreO: computerScore,
        scoreDraw: result === "draw" ? 1 : 0,
      },
      userPreferences: {
        theme:
          typeof localStorage !== "undefined"
            ? localStorage.getItem("theme") || "light"
            : "light",
        gameMode: additionalData.gameMode || "playerVsComputer",
      },
      gameState: additionalData.gameState || {
        currentPlayer: "X",
        gameOver: true,
      },
      deviceInfo: {
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
        platform: typeof navigator !== "undefined" ? navigator.platform : null,
        language: typeof navigator !== "undefined" ? navigator.language : null,
      },
      ...additionalData,
    };

    const docRef = await addDoc(collection(db, "leaderboard"), scoreData);
    console.log("Score berhasil disimpan dengan ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error menyimpan score:", error);
    return null;
  }
}

/**
 * READ - Membaca semua data leaderboard dengan sorting berdasarkan humanScore
 * @param {number} limitCount - Jumlah data yang diambil (default: 10)
 * @returns {Promise<Array>} Array of leaderboard documents
 */
export async function getLeaderboard(limitCount = 10) {
  try {
    const q = query(
      collection(db, "leaderboard"),
      orderBy("humanScore", "desc"),
      limit(limitCount)
    );

    const querySnapshot = await getDocs(q);
    const leaderboard = [];

    querySnapshot.forEach((doc) => {
      leaderboard.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    console.log(`Leaderboard loaded: ${leaderboard.length} entries`);
    return leaderboard;
  } catch (error) {
    console.error("Error mengambil leaderboard:", error);
    return [];
  }
}

/**
 * READ - Membaca score berdasarkan ID dokumen
 * @param {string} scoreId - ID dokumen leaderboard
 * @returns {Promise<Object|null>} Data score atau null jika tidak ditemukan
 */
export async function getScoreById(scoreId) {
  try {
    const docRef = doc(db, "leaderboard", scoreId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      console.log("Score tidak ditemukan!");
      return null;
    }
  } catch (error) {
    console.error("Error mengambil score:", error);
    return null;
  }
}

/**
 * READ - Membaca semua score dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Array>} Array of user's scores
 */
export async function getUserScores(userId = null) {
  try {
    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return [];
    }

    const targetUserId = userId || user.uid;
    const q = query(
      collection(db, "leaderboard"),
      where("userId", "==", targetUserId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const userScores = [];

    querySnapshot.forEach((doc) => {
      userScores.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return userScores;
  } catch (error) {
    console.error("Error mengambil user scores:", error);
    return [];
  }
}

/**
 * UPDATE - Memperbarui result dari score tertentu
 * @param {string} scoreId - ID dokumen score
 * @param {string} newResult - Result baru: 'win', 'lose', atau 'draw'
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function updateScoreResult(scoreId, newResult) {
  try {
    const scoreRef = doc(db, "leaderboard", scoreId);
    await updateDoc(scoreRef, {
      result: newResult,
      timestamp: serverTimestamp(),
    });
    console.log("Score result berhasil diupdate!");
    return true;
  } catch (error) {
    console.error("Error mengupdate score:", error);
    return false;
  }
}

/**
 * UPDATE - Memperbarui gameTime dari score
 * @param {string} scoreId - ID dokumen score
 * @param {number} newGameTime - Waktu permainan baru dalam detik
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function updateScoreGameTime(scoreId, newGameTime) {
  try {
    const scoreRef = doc(db, "leaderboard", scoreId);
    await updateDoc(scoreRef, {
      gameTime: newGameTime,
    });
    console.log("Game time berhasil diupdate!");
    return true;
  } catch (error) {
    console.error("Error mengupdate game time:", error);
    return false;
  }
}

/**
 * DELETE - Menghapus score dari leaderboard
 * @param {string} scoreId - ID dokumen score yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function deleteScore(scoreId) {
  try {
    await deleteDoc(doc(db, "leaderboard", scoreId));
    console.log("Score berhasil dihapus!");
    return true;
  } catch (error) {
    console.error("Error menghapus score:", error);
    return false;
  }
}

/**
 * DELETE - Menghapus field tertentu dari score
 * @param {string} scoreId - ID dokumen score
 * @param {string} fieldName - Nama field yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function removeScoreField(scoreId, fieldName) {
  try {
    const scoreRef = doc(db, "leaderboard", scoreId);
    await updateDoc(scoreRef, {
      [fieldName]: deleteField(),
    });
    console.log(`Field '${fieldName}' berhasil dihapus!`);
    return true;
  } catch (error) {
    console.error("Error menghapus field:", error);
    return false;
  }
}

// ===============================
// 2. GAMEHISTORY COLLECTION
// ===============================

/**
 * CREATE - Menambahkan history game dengan detail moves
 * @param {Array} moves - Array of moves [{player, position, timestamp}]
 * @param {Array} boardState - Final board state [9 elements]
 * @param {string} gameId - ID dari document leaderboard yang terkait
 * @returns {Promise<string|null>} ID dokumen history atau null jika error
 */
export async function addGameHistory(moves, boardState, gameId) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, history tidak disimpan");
      return null;
    }

    const historyData = {
      userId: user.uid,
      userEmail: user.email,
      gameId: gameId,
      moves: moves, // Array of move objects
      boardState: boardState, // Final board state [0-8]
      timestamp: serverTimestamp(),
      moveCount: moves ? moves.length : 0,
    };

    const docRef = await addDoc(collection(db, "gameHistory"), historyData);
    console.log("Game history berhasil disimpan dengan ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error menyimpan game history:", error);
    return null;
  }
}

/**
 * READ - Membaca game history berdasarkan ID
 * @param {string} historyId - ID dokumen history
 * @returns {Promise<Object|null>} Data history atau null jika tidak ditemukan
 */
export async function getGameHistoryById(historyId) {
  try {
    const docRef = doc(db, "gameHistory", historyId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      console.log("Game history tidak ditemukan!");
      return null;
    }
  } catch (error) {
    console.error("Error mengambil game history:", error);
    return null;
  }
}

/**
 * READ - Membaca semua game history dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Array>} Array of game history documents
 */
export async function getUserGameHistory(userId = null) {
  try {
    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return [];
    }

    const targetUserId = userId || user.uid;
    const q = query(
      collection(db, "gameHistory"),
      where("userId", "==", targetUserId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const historyList = [];

    querySnapshot.forEach((doc) => {
      historyList.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return historyList;
  } catch (error) {
    console.error("Error mengambil game history:", error);
    return [];
  }
}

/**
 * READ - Membaca game history berdasarkan gameId (link ke leaderboard)
 * @param {string} gameId - ID dari document leaderboard
 * @returns {Promise<Object|null>} Data history atau null jika tidak ditemukan
 */
export async function getGameHistoryByGameId(gameId) {
  try {
    const q = query(
      collection(db, "gameHistory"),
      where("gameId", "==", gameId),
      limit(1)
    );

    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return {
        id: doc.id,
        ...doc.data(),
      };
    } else {
      console.log("Game history tidak ditemukan untuk gameId:", gameId);
      return null;
    }
  } catch (error) {
    console.error("Error mengambil game history:", error);
    return null;
  }
}

/**
 * UPDATE - Menambahkan move baru ke array moves dalam game history
 * @param {string} historyId - ID dokumen history
 * @param {Object} newMove - Move object {player, position, timestamp}
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function addMoveToHistory(historyId, newMove) {
  try {
    const historyRef = doc(db, "gameHistory", historyId);
    await updateDoc(historyRef, {
      moves: arrayUnion(newMove),
      moveCount: increment(1),
      timestamp: serverTimestamp(),
    });
    console.log("Move berhasil ditambahkan ke history!");
    return true;
  } catch (error) {
    console.error("Error menambahkan move:", error);
    return false;
  }
}

/**
 * UPDATE - Memperbarui board state dalam game history
 * @param {string} historyId - ID dokumen history
 * @param {Array} newBoardState - Board state baru [9 elements]
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function updateHistoryBoardState(historyId, newBoardState) {
  try {
    const historyRef = doc(db, "gameHistory", historyId);
    await updateDoc(historyRef, {
      boardState: newBoardState,
    });
    console.log("Board state berhasil diupdate!");
    return true;
  } catch (error) {
    console.error("Error mengupdate board state:", error);
    return false;
  }
}

/**
 * DELETE - Menghapus game history
 * @param {string} historyId - ID dokumen history yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function deleteGameHistory(historyId) {
  try {
    await deleteDoc(doc(db, "gameHistory", historyId));
    console.log("Game history berhasil dihapus!");
    return true;
  } catch (error) {
    console.error("Error menghapus game history:", error);
    return false;
  }
}

// ===============================
// 3. USERPREFERENCES COLLECTION
// ===============================

/**
 * CREATE/UPDATE - Menambahkan atau update user preferences (menggunakan userId sebagai document ID)
 * @param {Object} preferences - User preferences {theme, gameMode, etc}
 * @returns {Promise<string|null>} ID dokumen (userId) atau null jika error
 */
export async function saveUserPreferences(preferences) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, preferences tidak disimpan");
      return null;
    }

    const preferencesData = {
      userId: user.uid,
      userEmail: user.email,
      preferences: preferences,
      lastUpdated: serverTimestamp(),
    };

    // Gunakan userId sebagai document ID untuk update yang mudah
    const userPrefsRef = doc(db, "userPreferences", user.uid);
    await setDoc(userPrefsRef, preferencesData, { merge: true });
    console.log("User preferences berhasil disimpan");
    return user.uid;
  } catch (error) {
    console.error("Error menyimpan user preferences:", error);
    return null;
  }
}

/**
 * READ - Membaca user preferences dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Object|null>} Data preferences atau null jika tidak ditemukan
 */
export async function getUserPreferences(userId = null) {
  try {
    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return null;
    }

    const targetUserId = userId || user.uid;
    const docRef = doc(db, "userPreferences", targetUserId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      console.log("User preferences tidak ditemukan!");
      return null;
    }
  } catch (error) {
    console.error("Error mengambil user preferences:", error);
    return null;
  }
}

/**
 * UPDATE - Memperbarui theme preference
 * @param {string} theme - Theme baru: 'light' atau 'dark'
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function updateUserTheme(theme) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    const userPrefsRef = doc(db, "userPreferences", user.uid);

    // Check if document exists first
    const docSnap = await getDoc(userPrefsRef);

    if (!docSnap.exists()) {
      // Document doesn't exist, create it with all required fields
      await setDoc(userPrefsRef, {
        userId: user.uid,
        userEmail: user.email,
        preferences: {
          theme: theme,
        },
        lastUpdated: serverTimestamp(),
      });
      console.log("User preferences created with theme:", theme);
    } else {
      // Document exists, update only theme
      await updateDoc(userPrefsRef, {
        "preferences.theme": theme,
        lastUpdated: serverTimestamp(),
      });
      console.log("Theme berhasil diupdate!");
    }
    return true;
  } catch (error) {
    console.error("Error mengupdate theme:", error);
    // Provide more specific error information
    if (error.code === "permission-denied") {
      console.error("Permission denied: Check Firestore security rules");
    } else if (error.code === "not-found") {
      console.error(
        "Document not found (should not happen after getDoc check)"
      );
    } else if (error.code === "unavailable") {
      console.error("Firestore service unavailable");
    }
    return false;
  }
}

/**
 * UPDATE - Memperbarui game mode preference
 * @param {string} gameMode - Game mode baru
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function updateUserGameMode(gameMode) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    const userPrefsRef = doc(db, "userPreferences", user.uid);

    // Check if document exists first
    const docSnap = await getDoc(userPrefsRef);

    if (!docSnap.exists()) {
      // Document doesn't exist, create it with all required fields
      await setDoc(userPrefsRef, {
        userId: user.uid,
        userEmail: user.email,
        preferences: {
          gameMode: gameMode,
        },
        lastUpdated: serverTimestamp(),
      });
      console.log("User preferences created with gameMode:", gameMode);
    } else {
      // Document exists, update only gameMode
      await updateDoc(userPrefsRef, {
        "preferences.gameMode": gameMode,
        lastUpdated: serverTimestamp(),
      });
      console.log("Game mode berhasil diupdate!");
    }
    return true;
  } catch (error) {
    console.error("Error mengupdate game mode:", error);
    // Provide more specific error information
    if (error.code === "permission-denied") {
      console.error("Permission denied: Check Firestore security rules");
    } else if (error.code === "not-found") {
      console.error(
        "Document not found (should not happen after getDoc check)"
      );
    } else if (error.code === "unavailable") {
      console.error("Firestore service unavailable");
    }
    return false;
  }
}

/**
 * DELETE - Menghapus user preferences
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function deleteUserPreferences(userId = null) {
  try {
    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return false;
    }

    const targetUserId = userId || user.uid;
    await deleteDoc(doc(db, "userPreferences", targetUserId));
    console.log("User preferences berhasil dihapus!");
    return true;
  } catch (error) {
    console.error("Error menghapus user preferences:", error);
    return false;
  }
}

// ===============================
// 4. USERSTATISTICS COLLECTION
// ===============================

/**
 * CREATE/UPDATE - Menambahkan atau update user statistics (menggunakan userId sebagai document ID)
 * @param {Object} stats - Statistics {totalGames, totalWins, totalDraws, totalLosses, bestTime, averageGameTime}
 * @returns {Promise<string|null>} ID dokumen (userId) atau null jika error
 */
export async function saveUserStatistics(stats) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, statistics tidak disimpan");
      return null;
    }

    const statsData = {
      userId: user.uid,
      userEmail: user.email,
      ...stats,
      lastUpdated: serverTimestamp(),
    };

    // Gunakan userId sebagai document ID
    const userStatsRef = doc(db, "userStatistics", user.uid);
    await setDoc(userStatsRef, statsData, { merge: true });
    console.log("Game statistics berhasil disimpan");
    return user.uid;
  } catch (error) {
    console.error("Error menyimpan game statistics:", error);
    return null;
  }
}

/**
 * READ - Membaca user statistics dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Object|null>} Data statistics atau null jika tidak ditemukan
 */
export async function getUserStatistics(userId = null) {
  try {
    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return null;
    }

    const targetUserId = userId || user.uid;
    const docRef = doc(db, "userStatistics", targetUserId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      console.log("User statistics tidak ditemukan!");
      return null;
    }
  } catch (error) {
    console.error("Error mengambil user statistics:", error);
    return null;
  }
}

/**
 * UPDATE - Increment total games
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function incrementTotalGames() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    const userStatsRef = doc(db, "userStatistics", user.uid);
    await updateDoc(userStatsRef, {
      totalGames: increment(1),
      lastUpdated: serverTimestamp(),
    });
    console.log("Total games berhasil diincrement!");
    return true;
  } catch (error) {
    console.error("Error mengincrement total games:", error);
    return false;
  }
}

/**
 * UPDATE - Increment win count
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function incrementWins() {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    const userStatsRef = doc(db, "userStatistics", user.uid);
    await updateDoc(userStatsRef, {
      totalWins: increment(1),
      lastUpdated: serverTimestamp(),
    });
    console.log("Wins berhasil diincrement!");
    return true;
  } catch (error) {
    console.error("Error mengincrement wins:", error);
    return false;
  }
}

/**
 * UPDATE - Update best time jika waktu baru lebih cepat
 * @param {number} newTime - Waktu baru dalam detik
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function updateBestTime(newTime) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    // Baca statistics dulu untuk membandingkan
    const currentStats = await getUserStatistics();
    if (
      !currentStats ||
      !currentStats.bestTime ||
      newTime < currentStats.bestTime
    ) {
      const userStatsRef = doc(db, "userStatistics", user.uid);

      // Use setDoc with merge to handle both create and update cases
      // If document doesn't exist, create it with required fields
      // If document exists, only update bestTime and lastUpdated
      const updateData = currentStats
        ? {
            bestTime: newTime,
            lastUpdated: serverTimestamp(),
          }
        : {
            userId: user.uid,
            userEmail: user.email,
            bestTime: newTime,
            lastUpdated: serverTimestamp(),
          };

      await setDoc(userStatsRef, updateData, { merge: true });
      if (currentStats) {
        console.log("Best time berhasil diupdate!");
      } else {
        console.log("User statistics document created with best time!");
      }
      return true;
    }
    // Best time tidak lebih baik dari yang sudah ada
    console.log("Best time tidak diupdate (waktu baru tidak lebih cepat)");
    return false;
  } catch (error) {
    console.error("Error mengupdate best time:", error);
    // Provide more specific error information
    if (error.code === "permission-denied") {
      console.error("Permission denied: Check Firestore security rules");
    } else if (error.code === "unavailable") {
      console.error("Firestore service unavailable");
    }
    return false;
  }
}

/**
 * DELETE - Menghapus user statistics
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function deleteUserStatistics(userId = null) {
  try {
    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return false;
    }

    const targetUserId = userId || user.uid;
    await deleteDoc(doc(db, "userStatistics", targetUserId));
    console.log("User statistics berhasil dihapus!");
    return true;
  } catch (error) {
    console.error("Error menghapus user statistics:", error);
    return false;
  }
}

// ===============================
// 5. SESSIONS COLLECTION
// ===============================

/**
 * CREATE - Menambahkan session data baru
 * @param {Object} sessionData - Session data {startTime, endTime, totalGames, totalTime}
 * @returns {Promise<string|null>} ID dokumen atau null jika error
 */
export async function addSessionData(sessionData) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, session data tidak disimpan");
      return null;
    }

    const sessionDataWithMeta = {
      userId: user.uid,
      userEmail: user.email,
      ...sessionData,
      timestamp: serverTimestamp(),
    };

    const docRef = await addDoc(
      collection(db, "sessions"),
      sessionDataWithMeta
    );
    console.log("Session data berhasil disimpan dengan ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error menyimpan session data:", error);
    return null;
  }
}

/**
 * READ - Membaca session data berdasarkan ID
 * @param {string} sessionId - ID dokumen session
 * @returns {Promise<Object|null>} Data session atau null jika tidak ditemukan
 */
export async function getSessionById(sessionId) {
  try {
    const docRef = doc(db, "sessions", sessionId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data(),
      };
    } else {
      console.log("Session tidak ditemukan!");
      return null;
    }
  } catch (error) {
    console.error("Error mengambil session:", error);
    return null;
  }
}

/**
 * READ - Membaca semua session dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Array>} Array of session documents
 */
export async function getUserSessions(userId = null) {
  try {
    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return [];
    }

    const targetUserId = userId || user.uid;
    const q = query(
      collection(db, "sessions"),
      where("userId", "==", targetUserId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const sessions = [];

    querySnapshot.forEach((doc) => {
      sessions.push({
        id: doc.id,
        ...doc.data(),
      });
    });

    return sessions;
  } catch (error) {
    console.error("Error mengambil sessions:", error);
    return [];
  }
}

/**
 * UPDATE - Memperbarui endTime dari session (menutup session)
 * @param {string} sessionId - ID dokumen session
 * @param {Date} endTime - Waktu session berakhir
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function closeSession(sessionId, endTime) {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      endTime: endTime,
      timestamp: serverTimestamp(),
    });
    console.log("Session berhasil ditutup!");
    return true;
  } catch (error) {
    console.error("Error menutup session:", error);
    return false;
  }
}

/**
 * UPDATE - Increment total games dalam session
 * @param {string} sessionId - ID dokumen session
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function incrementSessionGames(sessionId) {
  try {
    const sessionRef = doc(db, "sessions", sessionId);
    await updateDoc(sessionRef, {
      totalGames: increment(1),
      timestamp: serverTimestamp(),
    });
    console.log("Session games berhasil diincrement!");
    return true;
  } catch (error) {
    console.error("Error mengincrement session games:", error);
    return false;
  }
}

/**
 * DELETE - Menghapus session data
 * @param {string} sessionId - ID dokumen session yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function deleteSession(sessionId) {
  try {
    await deleteDoc(doc(db, "sessions", sessionId));
    console.log("Session berhasil dihapus!");
    return true;
  } catch (error) {
    console.error("Error menghapus session:", error);
    return false;
  }
}

// ===============================
// ADVANCED OPERATIONS
// ===============================

/**
 * Batched Write - Menyimpan game data dan history secara bersamaan
 * @param {Object} scoreData - Data score untuk leaderboard
 * @param {Object} historyData - Data history untuk gameHistory
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function saveGameDataWithHistory(scoreData, historyData) {
  try {
    const batch = writeBatch(db);

    // Add score
    const scoreRef = doc(collection(db, "leaderboard"));
    batch.set(scoreRef, {
      ...scoreData,
      timestamp: serverTimestamp(),
    });

    // Add history (with gameId reference)
    const historyRef = doc(collection(db, "gameHistory"));
    batch.set(historyRef, {
      ...historyData,
      gameId: scoreRef.id,
      timestamp: serverTimestamp(),
    });

    // Commit batch
    await batch.commit();
    console.log("Game data dan history berhasil disimpan!");
    return true;
  } catch (error) {
    console.error("Error dalam batched write:", error);
    return false;
  }
}

/**
 * Transaction - Update statistics secara atomik
 * @param {string} userId - ID user
 * @param {string} newGameResult - Result game baru: 'win', 'lose', atau 'draw'
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
export async function updateStatisticsAtomically(userId, newGameResult) {
  try {
    // Get user email from auth for new document creation
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    // Validate that userId matches current user for security
    if (userId !== user.uid) {
      console.warn("UserId tidak sesuai dengan user yang sedang login");
      return false;
    }

    await runTransaction(db, async (transaction) => {
      const statsRef = doc(db, "userStatistics", userId);
      const statsDoc = await transaction.get(statsRef);

      if (!statsDoc.exists()) {
        // Create new stats document with all required fields including userEmail
        transaction.set(statsRef, {
          userId: userId,
          userEmail: user.email,
          totalGames: 1,
          totalWins: newGameResult === "win" ? 1 : 0,
          totalDraws: newGameResult === "draw" ? 1 : 0,
          totalLosses: newGameResult === "lose" ? 1 : 0,
          lastUpdated: serverTimestamp(),
        });
      } else {
        const currentStats = statsDoc.data();
        const newStats = {
          totalGames: (currentStats.totalGames || 0) + 1,
          totalWins:
            newGameResult === "win"
              ? (currentStats.totalWins || 0) + 1
              : currentStats.totalWins || 0,
          totalDraws:
            newGameResult === "draw"
              ? (currentStats.totalDraws || 0) + 1
              : currentStats.totalDraws || 0,
          totalLosses:
            newGameResult === "lose"
              ? (currentStats.totalLosses || 0) + 1
              : currentStats.totalLosses || 0,
          lastUpdated: serverTimestamp(),
        };
        transaction.update(statsRef, newStats);
      }
    });
    console.log("Statistics berhasil diupdate!");
    return true;
  } catch (error) {
    console.error("Error dalam transaction:", error);
    return false;
  }
}

// Export db dan auth untuk penggunaan di file lain jika diperlukan
export { db, auth };
