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
  if (!(await ensureFirebaseReady())) return null;

  const user = auth.currentUser;
  if (!user) return null;

  const { collection, addDoc, serverTimestamp } = window.firestore;

  const resetTimestampISO =
    localStorage.getItem("scoreResetTimestamp") ||
    new Date().toISOString();

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
}

// ===============================
// GET LEADERBOARD (AGGREGATED)
// ===============================
async function getLeaderboard(limit = 5) {
  if (!(await ensureFirebaseReady())) return [];

  const { collection, getDocs } = window.firestore;

  // ⛔ NO orderBy, NO limit here
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
      s.totalHumanScore += 3;
      s.winCount++;
    } else if (d.result === "lose") {
      s.totalHumanScore -= 2;
      s.loseCount++;
    } else {
      // draw
      s.drawCount++;
    }

    s.totalGameTime += d.gameTime || 0;
    s.gameCount++;
  });

  return Array.from(map.values())
    .sort((a, b) =>
      b.totalHumanScore - a.totalHumanScore ||
      b.winCount - a.winCount ||
      a.totalGameTime - b.totalGameTime
    )
    .slice(0, limit)
    .map((u, i) => ({
      rank: i + 1,
      userId: u.userId,
      userEmail: u.userEmail,

      // 🔽 JELAS
      totalScore: u.totalHumanScore,   // score berbasis poin
      winCount: u.winCount,
      loseCount: u.loseCount,
      drawCount: u.drawCount,

      totalGameTime: u.totalGameTime,
      gameCount: u.gameCount,
    }));

}

// ===============================
// GET USER SCORES (RAW)
// ===============================
async function getUserScores(userId = null) {
  if (!(await ensureFirebaseReady())) return [];

  const user = auth.currentUser;
  const uid = userId || user?.uid;
  if (!uid) return [];

  const { collection, query, where, getDocs } = window.firestore;

  const q = query(
    collection(db, "leaderboard"),
    where("userId", "==", uid)
  );

  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

// ===============================
// SAVE GAME HISTORY
// ===============================
async function saveGameHistory(moves, boardState, gameId) {
  if (!(await ensureFirebaseReady())) return null;

  const user = auth.currentUser;
  if (!user) return null;

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
}

// ===============================
// SAVE USER PREFERENCES
// ===============================
async function saveUserPreferences(preferences) {
  if (!(await ensureFirebaseReady())) return null;

  const user = auth.currentUser;
  if (!user) return null;

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
}

// ===============================
// SAVE GAME STATISTICS
// ===============================
async function saveGameStatistics(stats) {
  if (!(await ensureFirebaseReady())) return null;

  const user = auth.currentUser;
  if (!user) return null;

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
