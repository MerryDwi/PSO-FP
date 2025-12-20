// ===============================
// LEADERBOARD SERVICE (FIRESTORE)
// ===============================

let db = null;
let auth = null;

// -------------------------------
// INIT FIRESTORE
// -------------------------------
function initFirestore() {
  if (typeof window === "undefined") return;

  if (window.firebaseDb && window.firebaseAuth) {
    db = window.firebaseDb;
    auth = window.firebaseAuth;
  }
}

if (typeof window !== "undefined") {
  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(initFirestore, 300);
  });
}

// -------------------------------
// HELPERS
// -------------------------------
function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function ensureFirebaseReady() {
  if (!db || !auth) {
    initFirestore();
    await sleep(200);
  }
  return db && auth && window.firestore;
}

// ===============================
// SAVE SCORE (PER GAME - RAW)
// ===============================
async function saveScore(humanScore, computerScore, gameTime, result) {
  try {
    if (!(await ensureFirebaseReady())) {
      throw new Error("Firebase is not ready");
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const { collection, addDoc, serverTimestamp } = window.firestore;

    const resetTimestampISO =
      localStorage.getItem("scoreResetTimestamp") || new Date().toISOString();

    localStorage.setItem("scoreResetTimestamp", resetTimestampISO);

    const docRef = await addDoc(collection(db, "leaderboard"), {
      userId: user.uid,
      userEmail: user.email,
      humanScore,
      computerScore,
      gameTime,
      result, // win | lose | draw
      timestamp: serverTimestamp(),
      resetTimestampISO,
    });

    return docRef.id;
  } catch (error) {
    throw new Error(`Failed to save score: ${error.message}`);
  }
}

// ===============================
// GET LEADERBOARD (AGGREGATED)
// ===============================
async function getLeaderboard(limit = 7) {
  try {
    if (!(await ensureFirebaseReady())) {
      throw new Error("Firebase is not ready");
    }

    const { collection, getDocs } = window.firestore;

    const snapshot = await getDocs(collection(db, "leaderboard"));

    const map = new Map();

    snapshot.forEach((doc) => {
      const d = doc.data();
      if (!d.userId) return;

      if (!map.has(d.userId)) {
        map.set(d.userId, {
          userId: d.userId,
          userEmail: d.userEmail,
          totalHumanScore: 0,
          totalComputerScore: 0,
          totalGameTime: 0,
          winCount: 0,
          loseCount: 0,
          drawCount: 0,
          gameCount: 0,
        });
      }

      const s = map.get(d.userId);
      if (d.result === "win") {
        s.totalHumanScore += 2;
        s.winCount++;
      } else if (d.result === "lose") {
        s.totalHumanScore -= 1;
        s.loseCount++;
      } else {
        // draw
        s.drawCount++;
      }

      s.totalGameTime += d.gameTime || 0;
      s.gameCount++;
    });

    return Array.from(map.values())
      .sort(
        (a, b) =>
          b.totalHumanScore - a.totalHumanScore ||
          b.winCount - a.winCount ||
          a.totalGameTime - b.totalGameTime
      )
      .slice(0, limit)
      .map((u, i) => ({
        rank: i + 1,
        userId: u.userId,
        userEmail: u.userEmail,

        totalScore: u.totalHumanScore, // score berbasis poin
        winCount: u.winCount,
        loseCount: u.loseCount,
        drawCount: u.drawCount,

        totalGameTime: u.totalGameTime,
        gameCount: u.gameCount,
      }));
  } catch (error) {
    throw new Error(`Failed to get leaderboard: ${error.message}`);
  }
}

// ===============================
// GET USER SCORES (RAW)
// ===============================
async function getUserScores(userId = null) {
  try {
    if (!(await ensureFirebaseReady())) {
      throw new Error("Firebase is not ready");
    }

    const user = auth.currentUser;
    const uid = userId || user?.uid;
    if (!uid) {
      throw new Error("User ID is not available");
    }

    const { collection, query, where, getDocs } = window.firestore;

    const q = query(collection(db, "leaderboard"), where("userId", "==", uid));

    const snap = await getDocs(q);
    return snap.docs.map((d) => d.data());
  } catch (error) {
    throw new Error(`Failed to get user scores: ${error.message}`);
  }
}

// ===============================
// SAVE GAME HISTORY
// ===============================
async function saveGameHistory(moves, boardState, gameId) {
  try {
    if (!(await ensureFirebaseReady())) {
      throw new Error("Firebase is not ready");
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const { collection, addDoc, serverTimestamp } = window.firestore;

    const ref = await addDoc(collection(db, "gameHistory"), {
      userId: user.uid,
      userEmail: user.email,
      gameId,
      moves,
      boardState,
      moveCount: moves?.length || 0,
      timestamp: serverTimestamp(),
    });

    return ref.id;
  } catch (error) {
    throw new Error(`Failed to save game history: ${error.message}`);
  }
}

// ===============================
// SAVE USER PREFERENCES
// ===============================
async function saveUserPreferences(preferences) {
  try {
    if (!(await ensureFirebaseReady())) {
      throw new Error("Firebase is not ready");
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const { doc, setDoc, serverTimestamp } = window.firestore;

    await setDoc(
      doc(db, "userPreferences", user.uid),
      {
        userId: user.uid,
        userEmail: user.email,
        preferences,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    return user.uid;
  } catch (error) {
    throw new Error(`Failed to save user preferences: ${error.message}`);
  }
}

// ===============================
// SAVE GAME STATISTICS
// ===============================
async function saveGameStatistics(stats) {
  try {
    if (!(await ensureFirebaseReady())) {
      throw new Error("Firebase is not ready");
    }

    const user = auth.currentUser;
    if (!user) {
      throw new Error("User is not authenticated");
    }

    const { doc, setDoc, serverTimestamp } = window.firestore;

    await setDoc(
      doc(db, "userStatistics", user.uid),
      {
        userId: user.uid,
        userEmail: user.email,
        ...stats,
        lastUpdated: serverTimestamp(),
      },
      { merge: true }
    );

    return user.uid;
  } catch (error) {
    throw new Error(`Failed to save game statistics: ${error.message}`);
  }
}

// ===============================
// EXPORT
// ===============================
if (typeof window !== "undefined") {
  window.leaderboardService = {
    initFirestore,
    saveScore,
    getLeaderboard,
    getUserScores,
    saveGameHistory,
    saveUserPreferences,
    saveGameStatistics,
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    initFirestore,
    saveScore,
    getLeaderboard,
    getUserScores,
    saveGameHistory,
    saveUserPreferences,
    saveGameStatistics,
  };
}
