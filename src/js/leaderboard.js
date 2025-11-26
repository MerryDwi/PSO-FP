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

    // Import Firestore functions
    const { collection, addDoc, serverTimestamp } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );

    const scoreData = {
      userId: user.uid,
      userEmail: user.email,
      humanScore: humanScore,
      computerScore: computerScore,
      gameTime: gameTime,
      result: result, // 'win', 'lose', atau 'draw'
      totalScore: calculatedScore || humanScore * 100, // Default logic if null
      winAndDrawCount: winDrawSum || humanScore, // Default logic if null
      timestamp: serverTimestamp(),
      gameMode: "playerVsComputer",
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
 * Mengambil data leaderboard dari Firestore
 * @param {number} limit - Jumlah data yang diambil (default: 10)
 * @returns {Promise<Array>} Array of score objects
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

    const {
      collection,
      query,
      orderBy,
      limit: limitQuery,
      getDocs,
    } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );

    const q = query(
      collection(db, "leaderboard"),
      orderBy("humanScore", "desc"),
      orderBy("timestamp", "desc"),
      limitQuery(limit)
    );

    const querySnapshot = await getDocs(q);
    const leaderboard = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      leaderboard.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        humanScore: data.humanScore,
        computerScore: data.computerScore,
        gameTime: data.gameTime,
        result: data.result,
        timestamp: data.timestamp,
      });
    });

    return leaderboard;
  } catch (error) {
    console.error("Error mengambil leaderboard:", error);
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

    const { collection, query, where, orderBy, getDocs } = await import(
      "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js"
    );

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
// EXPORTS
// ===============================
if (typeof window !== "undefined") {
  window.leaderboardService = {
    saveScore,
    getLeaderboard,
    getUserScores,
    initFirestore,
  };
}

// Export for Node/Jest testing
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    saveScore,
    getLeaderboard,
    getUserScores,
    initFirebase,
  };
}
