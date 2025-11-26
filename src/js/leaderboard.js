// ===============================
// LEADERBOARD SERVICE (FIRESTORE)
// ===============================
// File ini menggunakan Firebase yang sudah di-load via script tag di HTML
// Pastikan Firebase Firestore sudah di-include di game.html

let db = null;
let auth = null;

// Initialize Firestore (dipanggil setelah Firebase script dimuat)
function initFirestore() {
  if (typeof window === "undefined") return; // Skip in Node/Jest

  try {
    // Gunakan Firebase yang sudah diinisialisasi di game.html
    if (window.firebaseApp && window.firebaseAuth && window.firebaseDb) {
      db = window.firebaseDb;
      auth = window.firebaseAuth;
      console.log("Firestore initialized from window");
    }
  } catch (error) {
    console.warn("Firestore belum tersedia, akan diinisialisasi nanti:", error);
  }
}

// Auto-initialize saat DOM ready
if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      setTimeout(initFirestore, 500); // Tunggu Firebase script dimuat
    });
  } else {
    setTimeout(initFirestore, 500);
  }
}

// ===============================
// SAVE SCORE TO FIRESTORE
// ===============================
/**
 * Menyimpan score game ke Firestore
 * @param {number} humanScore - Score player (X)
 * @param {number} computerScore - Score computer (O)
 * @param {number} gameTime - Waktu permainan dalam detik
 * @param {string} result - Hasil game: 'win', 'lose', atau 'draw'
 * @returns {Promise<string|null>} ID dokumen yang disimpan atau null jika error
 */
async function saveScore(humanScore, computerScore, gameTime, result) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    // Pastikan Firestore sudah diinisialisasi
    if (!db || !auth) {
      initFirestore();
      // Tunggu sebentar untuk inisialisasi
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    // Coba ambil dari window jika belum ada
    if (!auth && window.firebaseAuth) {
      auth = window.firebaseAuth;
    }
    if (!db && window.firebaseDb) {
      db = window.firebaseDb;
    }

    if (!db || !auth) {
      console.warn("Firebase belum diinisialisasi");
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, score tidak disimpan");
      return null;
    }

    // Gunakan Firestore functions dari window
    if (!window.firestore) {
      console.error("Firestore functions belum tersedia");
      return null;
    }

    const { collection, addDoc, serverTimestamp } = window.firestore;

    // Ambil reset timestamp dari localStorage (jika ada)
    // Jika belum ada, gunakan timestamp pertama kali game dimainkan sebagai session start
    let resetTimestampISO = null;
    if (typeof localStorage !== "undefined") {
      const resetTimestampStr = localStorage.getItem("scoreResetTimestamp");
      if (resetTimestampStr) {
        resetTimestampISO = resetTimestampStr;
      } else {
        // Jika belum ada reset timestamp, set session start sekarang
        resetTimestampISO = new Date().toISOString();
        localStorage.setItem("scoreResetTimestamp", resetTimestampISO);
      }
    }

    // Ambil data tambahan dari game state jika tersedia
    const gameState =
      typeof window !== "undefined" && window.gameState
        ? window.gameState
        : null;
    const currentScores = {
      scoreX:
        typeof window !== "undefined" && window.scoreX !== undefined
          ? window.scoreX
          : humanScore,
      scoreO:
        typeof window !== "undefined" && window.scoreO !== undefined
          ? window.scoreO
          : computerScore,
      scoreDraw:
        typeof window !== "undefined" && window.scoreDraw !== undefined
          ? window.scoreDraw
          : 0,
    };

    // Ambil user preferences dari localStorage
    const userPreferences = {
      theme:
        typeof localStorage !== "undefined"
          ? localStorage.getItem("theme") || "light"
          : "light",
      gameMode:
        typeof window !== "undefined" && window.gameMode
          ? window.gameMode
          : "playerVsComputer",
    };

    const scoreData = {
      userId: user.uid,
      userEmail: user.email,
      humanScore: humanScore,
      computerScore: computerScore,
      gameTime: gameTime,
      result: result, // 'win', 'lose', atau 'draw'
      timestamp: serverTimestamp(),
      gameMode: "playerVsComputer",
      resetTimestampISO: resetTimestampISO, // Untuk grouping per session

      // Data tambahan
      currentScores: currentScores, // Score saat ini (X, O, Draw)
      userPreferences: userPreferences, // User preferences (theme, mode)
      gameState: gameState
        ? {
            currentPlayer: gameState.currentPlayer,
            gameOver: gameState.gameOver,
          }
        : null,
      deviceInfo: {
        userAgent:
          typeof navigator !== "undefined" ? navigator.userAgent : null,
        platform: typeof navigator !== "undefined" ? navigator.platform : null,
        language: typeof navigator !== "undefined" ? navigator.language : null,
      },
    };

    const docRef = await addDoc(collection(db, "leaderboard"), scoreData);
    console.log("Score berhasil disimpan dengan ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Error menyimpan score:", error);
    return null;
  }
}

// ===============================
// GET LEADERBOARD
// ===============================
/**
 * Mengambil data leaderboard dari Firestore dengan agregasi per user
 * @param {number} limit - Jumlah user yang diambil (default: 10)
 * @returns {Promise<Array>} Array of aggregated leaderboard objects per user
 */
async function getLeaderboard(limit = 10) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Pastikan Firestore sudah diinisialisasi
    if (!db) {
      initFirestore();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!db && window.firebaseDb) {
      db = window.firebaseDb;
    }

    if (!db) {
      console.warn("Firestore belum tersedia");
      return [];
    }

    // Gunakan Firestore functions dari window
    if (!window.firestore) {
      console.error("Firestore functions belum tersedia");
      return [];
    }

    const {
      collection,
      query,
      orderBy,
      limit: limitQuery,
      getDocs,
    } = window.firestore;

    // Query dengan single orderBy untuk menghindari composite index requirement
    const q = query(
      collection(db, "leaderboard"),
      orderBy("humanScore", "desc"),
      limitQuery(limit)
    );

    const querySnapshot = await getDocs(q);
    const allScores = [];

    // Ambil semua data
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      allScores.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        humanScore: data.humanScore || 0,
        computerScore: data.computerScore || 0,
        gameTime: data.gameTime || 0,
        result: data.result || "draw",
        timestamp: data.timestamp,
        resetTimestampISO: data.resetTimestampISO || null,
      });
    });

    // Kelompokkan per user dan resetTimestamp, lalu agregasi
    const userStatsMap = new Map();

    allScores.forEach((score) => {
      // Untuk backward compatibility, jika tidak ada resetTimestampISO,
      // gunakan timestamp pertama sebagai session identifier
      const sessionKey =
        score.resetTimestampISO ||
        (score.timestamp
          ? score.timestamp.toDate
            ? score.timestamp.toDate().toISOString()
            : new Date(score.timestamp).toISOString()
          : "no-session");
      const key = `${score.userId}_${sessionKey}`;

      if (!userStatsMap.has(key)) {
        userStatsMap.set(key, {
          userId: score.userId,
          userEmail: score.userEmail,
          resetTimestampISO: score.resetTimestampISO,
          totalHumanScore: 0,
          totalComputerScore: 0,
          totalGameTime: 0,
          winCount: 0,
          loseCount: 0,
          drawCount: 0,
          gameCount: 0,
          firstGameTimestamp: score.timestamp,
          lastGameTimestamp: score.timestamp,
        });
      }

      const stats = userStatsMap.get(key);
      stats.totalHumanScore += score.humanScore;
      stats.totalComputerScore += score.computerScore;
      stats.totalGameTime += score.gameTime;
      stats.gameCount += 1;

      if (score.result === "win") {
        stats.winCount += 1;
      } else if (score.result === "lose") {
        stats.loseCount += 1;
      } else {
        stats.drawCount += 1;
      }

      // Update timestamps
      if (score.timestamp) {
        const scoreTime = score.timestamp.toDate
          ? score.timestamp.toDate()
          : new Date(score.timestamp);
        const firstTime = stats.firstGameTimestamp.toDate
          ? stats.firstGameTimestamp.toDate()
          : new Date(stats.firstGameTimestamp);
        const lastTime = stats.lastGameTimestamp.toDate
          ? stats.lastGameTimestamp.toDate()
          : new Date(stats.lastGameTimestamp);

        if (scoreTime < firstTime) {
          stats.firstGameTimestamp = score.timestamp;
        }
        if (scoreTime > lastTime) {
          stats.lastGameTimestamp = score.timestamp;
        }
      }
    });

    // Convert map to array dan sort berdasarkan totalHumanScore
    const leaderboard = Array.from(userStatsMap.values())
      .sort((a, b) => b.totalHumanScore - a.totalHumanScore)
      .slice(0, limit)
      .map((stats, index) => ({
        rank: index + 1,
        userId: stats.userId,
        userEmail: stats.userEmail,
        totalHumanScore: stats.totalHumanScore,
        totalComputerScore: stats.totalComputerScore,
        totalGameTime: stats.totalGameTime,
        winCount: stats.winCount,
        loseCount: stats.loseCount,
        drawCount: stats.drawCount,
        gameCount: stats.gameCount,
        sessionStart: stats.firstGameTimestamp,
        sessionEnd: stats.lastGameTimestamp,
        resetTimestamp: stats.resetTimestampISO,
      }));

    console.log(`Leaderboard loaded: ${leaderboard.length} users`);
    return leaderboard;
  } catch (error) {
    console.error("Error mengambil leaderboard:", error);
    // Jika error karena index, coba query tanpa orderBy
    if (
      error.code === "failed-precondition" ||
      error.message?.includes("index")
    ) {
      console.warn("Index belum dibuat, mencoba query tanpa orderBy...");
      try {
        const {
          collection,
          query: queryFn,
          limit: limitQuery,
          getDocs,
        } = window.firestore;
        const simpleQuery = queryFn(
          collection(db, "leaderboard"),
          limitQuery(limit)
        );
        const simpleSnapshot = await getDocs(simpleQuery);
        const allScores = [];
        simpleSnapshot.forEach((doc) => {
          const data = doc.data();
          allScores.push({
            id: doc.id,
            userId: data.userId,
            userEmail: data.userEmail,
            humanScore: data.humanScore || 0,
            computerScore: data.computerScore || 0,
            gameTime: data.gameTime || 0,
            result: data.result || "draw",
            timestamp: data.timestamp,
            resetTimestampISO: data.resetTimestampISO || null,
          });
        });

        // Kelompokkan dan agregasi (sama seperti di atas)
        const userStatsMap = new Map();
        allScores.forEach((score) => {
          // Untuk backward compatibility
          const sessionKey =
            score.resetTimestampISO ||
            (score.timestamp
              ? score.timestamp.toDate
                ? score.timestamp.toDate().toISOString()
                : new Date(score.timestamp).toISOString()
              : "no-session");
          const key = `${score.userId}_${sessionKey}`;

          if (!userStatsMap.has(key)) {
            userStatsMap.set(key, {
              userId: score.userId,
              userEmail: score.userEmail,
              resetTimestampISO: score.resetTimestampISO,
              totalHumanScore: 0,
              totalComputerScore: 0,
              totalGameTime: 0,
              winCount: 0,
              loseCount: 0,
              drawCount: 0,
              gameCount: 0,
              firstGameTimestamp: score.timestamp,
              lastGameTimestamp: score.timestamp,
            });
          }

          const stats = userStatsMap.get(key);
          stats.totalHumanScore += score.humanScore;
          stats.totalComputerScore += score.computerScore;
          stats.totalGameTime += score.gameTime;
          stats.gameCount += 1;

          if (score.result === "win") {
            stats.winCount += 1;
          } else if (score.result === "lose") {
            stats.loseCount += 1;
          } else {
            stats.drawCount += 1;
          }
        });

        const leaderboard = Array.from(userStatsMap.values())
          .sort((a, b) => b.totalHumanScore - a.totalHumanScore)
          .slice(0, limit)
          .map((stats, index) => ({
            rank: index + 1,
            userId: stats.userId,
            userEmail: stats.userEmail,
            totalHumanScore: stats.totalHumanScore,
            totalComputerScore: stats.totalComputerScore,
            totalGameTime: stats.totalGameTime,
            winCount: stats.winCount,
            loseCount: stats.loseCount,
            drawCount: stats.drawCount,
            gameCount: stats.gameCount,
            sessionStart: stats.firstGameTimestamp,
            sessionEnd: stats.lastGameTimestamp,
            resetTimestamp: stats.resetTimestampISO,
          }));

        console.log(
          `Leaderboard loaded (fallback): ${leaderboard.length} users`
        );
        return leaderboard;
      } catch (fallbackError) {
        console.error("Error fallback query:", fallbackError);
        return [];
      }
    }
    return [];
  }
}

// ===============================
// GET USER SCORES
// ===============================
/**
 * Mengambil semua score dari user tertentu
 * @param {string} userId - User ID (optional, default: current user)
 * @returns {Promise<Array>} Array of user's score objects
 */
async function getUserScores(userId = null) {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    // Pastikan Firestore sudah diinisialisasi
    if (!db || !auth) {
      initFirestore();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!auth && window.firebaseAuth) {
      auth = window.firebaseAuth;
    }
    if (!db && window.firebaseDb) {
      db = window.firebaseDb;
    }

    if (!db || !auth) {
      console.warn("Firebase belum diinisialisasi");
      return [];
    }

    const user = auth.currentUser;
    if (!user && !userId) {
      console.warn("User belum login");
      return [];
    }

    const targetUserId = userId || user.uid;

    // Gunakan Firestore functions dari window
    if (!window.firestore) {
      console.error("Firestore functions belum tersedia");
      return [];
    }

    const { collection, query, where, orderBy, getDocs } = window.firestore;

    const q = query(
      collection(db, "leaderboard"),
      where("userId", "==", targetUserId),
      orderBy("timestamp", "desc")
    );

    const querySnapshot = await getDocs(q);
    const userScores = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      userScores.push({
        id: doc.id,
        humanScore: data.humanScore,
        computerScore: data.computerScore,
        gameTime: data.gameTime,
        result: data.result,
        timestamp: data.timestamp,
      });
    });

    return userScores;
  } catch (error) {
    console.error("Error mengambil user scores:", error);
    return [];
  }
}

// ===============================
// SAVE GAME HISTORY (DETAIL MOVES)
// ===============================
/**
 * Menyimpan history game dengan detail moves ke Firestore
 * @param {Array} moves - Array of moves [{player, position, timestamp}]
 * @param {Array} boardState - Final board state
 * @param {string} gameId - ID dari score yang sudah disimpan
 * @returns {Promise<string|null>} ID dokumen history atau null jika error
 */
async function saveGameHistory(moves, boardState, gameId) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!db || !auth) {
      initFirestore();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!auth && window.firebaseAuth) {
      auth = window.firebaseAuth;
    }
    if (!db && window.firebaseDb) {
      db = window.firebaseDb;
    }

    if (!db || !auth) {
      console.warn("Firebase belum diinisialisasi");
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, history tidak disimpan");
      return null;
    }

    if (!window.firestore) {
      console.error("Firestore functions belum tersedia");
      return null;
    }

    const { collection, addDoc, serverTimestamp } = window.firestore;

    const historyData = {
      userId: user.uid,
      userEmail: user.email,
      gameId: gameId, // Link ke score document
      moves: moves, // Array of moves
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

// ===============================
// SAVE USER PREFERENCES
// ===============================
/**
 * Menyimpan user preferences ke Firestore
 * @param {Object} preferences - User preferences {theme, gameMode, etc}
 * @returns {Promise<string|null>} ID dokumen atau null jika error
 */
async function saveUserPreferences(preferences) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!db || !auth) {
      initFirestore();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!auth && window.firebaseAuth) {
      auth = window.firebaseAuth;
    }
    if (!db && window.firebaseDb) {
      db = window.firebaseDb;
    }

    if (!db || !auth) {
      console.warn("Firebase belum diinisialisasi");
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, preferences tidak disimpan");
      return null;
    }

    if (!window.firestore) {
      console.error("Firestore functions belum tersedia");
      return null;
    }

    const { collection, doc, setDoc, serverTimestamp } = window.firestore;

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

// ===============================
// SAVE GAME STATISTICS
// ===============================
/**
 * Update atau create game statistics untuk user
 * @param {Object} stats - Statistics {totalGames, totalWins, totalDraws, totalLosses, bestTime, etc}
 * @returns {Promise<string|null>} ID dokumen atau null jika error
 */
async function saveGameStatistics(stats) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!db || !auth) {
      initFirestore();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!auth && window.firebaseAuth) {
      auth = window.firebaseAuth;
    }
    if (!db && window.firebaseDb) {
      db = window.firebaseDb;
    }

    if (!db || !auth) {
      console.warn("Firebase belum diinisialisasi");
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, statistics tidak disimpan");
      return null;
    }

    if (!window.firestore) {
      console.error("Firestore functions belum tersedia");
      return null;
    }

    const { collection, doc, setDoc, serverTimestamp, increment } =
      window.firestore;

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

// ===============================
// SAVE SESSION DATA
// ===============================
/**
 * Menyimpan session data ke Firestore
 * @param {Object} sessionData - Session data {startTime, endTime, totalGames, etc}
 * @returns {Promise<string|null>} ID dokumen atau null jika error
 */
async function saveSessionData(sessionData) {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    if (!db || !auth) {
      initFirestore();
      await new Promise((resolve) => setTimeout(resolve, 300));
    }

    if (!auth && window.firebaseAuth) {
      auth = window.firebaseAuth;
    }
    if (!db && window.firebaseDb) {
      db = window.firebaseDb;
    }

    if (!db || !auth) {
      console.warn("Firebase belum diinisialisasi");
      return null;
    }

    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, session data tidak disimpan");
      return null;
    }

    if (!window.firestore) {
      console.error("Firestore functions belum tersedia");
      return null;
    }

    const { collection, addDoc, serverTimestamp } = window.firestore;

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

// ===============================
// EXPORTS
// ===============================
if (typeof window !== "undefined") {
  window.leaderboardService = {
    saveScore,
    getLeaderboard,
    getUserScores,
    initFirestore,
    saveGameHistory,
    saveUserPreferences,
    saveGameStatistics,
    saveSessionData,
  };
}

// Export for Node/Jest testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    saveScore,
    getLeaderboard,
    getUserScores,
    initFirestore,
    saveGameHistory,
    saveUserPreferences,
    saveGameStatistics,
    saveSessionData,
  };
}
