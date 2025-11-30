# Firestore CRUD Operations untuk Aplikasi Tic-Tac-Toe

Dokumentasi lengkap untuk melakukan operasi CRUD (Create, Read, Update, Delete) dengan Cloud Firestore untuk aplikasi game Tic-Tac-Toe.

## Setup Awal

Pertama, pastikan Firebase sudah diinisialisasi dan import fungsi-fungsi Firestore yang diperlukan:

```javascript
// Import the functions you need from the Firebase SDKs
import { initializeApp } from "firebase/app";
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
  arrayUnion,
  arrayRemove,
  FieldValue,
  serverTimestamp,
  deleteField,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXw-mEwyjH9qA5W8jM5W3zSwbXqMhRk",
  authDomain: "pso-fp-aci5ba.firebaseapp.com",
  projectId: "pso-fp-aci5ba",
  storageBucket: "pso-fp-aci5ba.appspot.com",
  messagingSenderId: "574242918850",
  appId: "1:574242918850:web:5ab90f7ac913323867",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firestore service
const db = getFirestore(app);
const auth = getAuth(app);
```

---

## 1. COLLECTION: leaderboard

### CREATE - Menambahkan Score Baru

```javascript
/**
 * Menambahkan score game baru ke leaderboard
 * @param {number} humanScore - Score player (X)
 * @param {number} computerScore - Score computer (O)
 * @param {number} gameTime - Waktu permainan dalam detik
 * @param {string} result - Hasil game: 'win', 'lose', atau 'draw'
 * @returns {Promise<string|null>} ID dokumen yang disimpan atau null jika error
 */
async function addScoreToLeaderboard(
  humanScore,
  computerScore,
  gameTime,
  result
) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login, score tidak disimpan");
      return null;
    }

    // Ambil reset timestamp dari localStorage (jika ada)
    let resetTimestampISO = localStorage.getItem("scoreResetTimestamp");
    if (!resetTimestampISO) {
      resetTimestampISO = new Date().toISOString();
      localStorage.setItem("scoreResetTimestamp", resetTimestampISO);
    }

    const scoreData = {
      userId: user.uid,
      userEmail: user.email,
      humanScore: humanScore,
      computerScore: computerScore,
      gameTime: gameTime,
      result: result, // 'win', 'lose', atau 'draw'
      timestamp: serverTimestamp(),
      gameMode: "playerVsComputer",
      resetTimestampISO: resetTimestampISO,
      currentScores: {
        scoreX: humanScore,
        scoreO: computerScore,
        scoreDraw: result === "draw" ? 1 : 0,
      },
      userPreferences: {
        theme: localStorage.getItem("theme") || "light",
        gameMode: "playerVsComputer",
      },
      gameState: {
        currentPlayer: "X",
        gameOver: true,
      },
      deviceInfo: {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
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

// Example usage:
// await addScoreToLeaderboard(2, 1, 45, "win");
```

### READ - Membaca Data Leaderboard

```javascript
/**
 * Membaca semua data leaderboard dengan sorting berdasarkan humanScore
 * @param {number} limitCount - Jumlah data yang diambil (default: 10)
 * @returns {Promise<Array>} Array of leaderboard documents
 */
async function getLeaderboard(limitCount = 10) {
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
 * Membaca score berdasarkan ID dokumen
 * @param {string} scoreId - ID dokumen leaderboard
 * @returns {Promise<Object|null>} Data score atau null jika tidak ditemukan
 */
async function getScoreById(scoreId) {
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
 * Membaca semua score dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Array>} Array of user's scores
 */
async function getUserScores(userId = null) {
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

// Example usage:
// const leaderboard = await getLeaderboard(10);
// const score = await getScoreById("some-score-id");
// const myScores = await getUserScores();
```

### UPDATE - Memperbarui Score

```javascript
/**
 * Memperbarui result dari score tertentu
 * @param {string} scoreId - ID dokumen score
 * @param {string} newResult - Result baru: 'win', 'lose', atau 'draw'
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function updateScoreResult(scoreId, newResult) {
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
 * Memperbarui gameTime dari score
 * @param {string} scoreId - ID dokumen score
 * @param {number} newGameTime - Waktu permainan baru dalam detik
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function updateScoreGameTime(scoreId, newGameTime) {
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

// Example usage:
// await updateScoreResult("some-score-id", "win");
// await updateScoreGameTime("some-score-id", 60);
```

### DELETE - Menghapus Score

```javascript
/**
 * Menghapus score dari leaderboard
 * @param {string} scoreId - ID dokumen score yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function deleteScore(scoreId) {
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
 * Menghapus field tertentu dari score
 * @param {string} scoreId - ID dokumen score
 * @param {string} fieldName - Nama field yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function removeScoreField(scoreId, fieldName) {
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

// Example usage:
// await deleteScore("some-score-id");
// await removeScoreField("some-score-id", "deviceInfo");
```

---

## 2. COLLECTION: gameHistory

### CREATE - Menambahkan Game History

```javascript
/**
 * Menambahkan history game dengan detail moves
 * @param {Array} moves - Array of moves [{player, position, timestamp}]
 * @param {Array} boardState - Final board state [9 elements]
 * @param {string} gameId - ID dari document leaderboard yang terkait
 * @returns {Promise<string|null>} ID dokumen history atau null jika error
 */
async function addGameHistory(moves, boardState, gameId) {
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

// Example usage:
// const moves = [
//   { player: "X", position: 0, timestamp: new Date().toISOString() },
//   { player: "O", position: 4, timestamp: new Date().toISOString() }
// ];
// const boardState = ["X", "", "", "", "O", "", "", "", ""];
// await addGameHistory(moves, boardState, "leaderboard-doc-id");
```

### READ - Membaca Game History

```javascript
/**
 * Membaca game history berdasarkan ID
 * @param {string} historyId - ID dokumen history
 * @returns {Promise<Object|null>} Data history atau null jika tidak ditemukan
 */
async function getGameHistoryById(historyId) {
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
 * Membaca semua game history dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Array>} Array of game history documents
 */
async function getUserGameHistory(userId = null) {
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
 * Membaca game history berdasarkan gameId (link ke leaderboard)
 * @param {string} gameId - ID dari document leaderboard
 * @returns {Promise<Object|null>} Data history atau null jika tidak ditemukan
 */
async function getGameHistoryByGameId(gameId) {
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

// Example usage:
// const history = await getGameHistoryById("some-history-id");
// const myHistory = await getUserGameHistory();
// const gameHistory = await getGameHistoryByGameId("leaderboard-doc-id");
```

### UPDATE - Memperbarui Game History

```javascript
/**
 * Menambahkan move baru ke array moves dalam game history
 * @param {string} historyId - ID dokumen history
 * @param {Object} newMove - Move object {player, position, timestamp}
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function addMoveToHistory(historyId, newMove) {
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
 * Memperbarui board state dalam game history
 * @param {string} historyId - ID dokumen history
 * @param {Array} newBoardState - Board state baru [9 elements]
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function updateHistoryBoardState(historyId, newBoardState) {
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

// Example usage:
// const newMove = { player: "X", position: 2, timestamp: new Date().toISOString() };
// await addMoveToHistory("some-history-id", newMove);
// await updateHistoryBoardState("some-history-id", ["X", "O", "X", "", "", "", "", "", ""]);
```

### DELETE - Menghapus Game History

```javascript
/**
 * Menghapus game history
 * @param {string} historyId - ID dokumen history yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function deleteGameHistory(historyId) {
  try {
    await deleteDoc(doc(db, "gameHistory", historyId));
    console.log("Game history berhasil dihapus!");
    return true;
  } catch (error) {
    console.error("Error menghapus game history:", error);
    return false;
  }
}

// Example usage:
// await deleteGameHistory("some-history-id");
```

---

## 3. COLLECTION: userPreferences

### CREATE - Menambahkan User Preferences

```javascript
/**
 * Menambahkan atau update user preferences (menggunakan userId sebagai document ID)
 * @param {Object} preferences - User preferences {theme, gameMode, etc}
 * @returns {Promise<string|null>} ID dokumen (userId) atau null jika error
 */
async function saveUserPreferences(preferences) {
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

// Example usage:
// await saveUserPreferences({
//   theme: "dark",
//   gameMode: "playerVsComputer"
// });
```

### READ - Membaca User Preferences

```javascript
/**
 * Membaca user preferences dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Object|null>} Data preferences atau null jika tidak ditemukan
 */
async function getUserPreferences(userId = null) {
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

// Example usage:
// const prefs = await getUserPreferences();
```

### UPDATE - Memperbarui User Preferences

```javascript
/**
 * Memperbarui theme preference
 * @param {string} theme - Theme baru: 'light' atau 'dark'
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function updateUserTheme(theme) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    const userPrefsRef = doc(db, "userPreferences", user.uid);
    await updateDoc(userPrefsRef, {
      "preferences.theme": theme,
      lastUpdated: serverTimestamp(),
    });
    console.log("Theme berhasil diupdate!");
    return true;
  } catch (error) {
    console.error("Error mengupdate theme:", error);
    return false;
  }
}

/**
 * Memperbarui game mode preference
 * @param {string} gameMode - Game mode baru
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function updateUserGameMode(gameMode) {
  try {
    const user = auth.currentUser;
    if (!user) {
      console.warn("User belum login");
      return false;
    }

    const userPrefsRef = doc(db, "userPreferences", user.uid);
    await updateDoc(userPrefsRef, {
      "preferences.gameMode": gameMode,
      lastUpdated: serverTimestamp(),
    });
    console.log("Game mode berhasil diupdate!");
    return true;
  } catch (error) {
    console.error("Error mengupdate game mode:", error);
    return false;
  }
}

// Example usage:
// await updateUserTheme("dark");
// await updateUserGameMode("playerVsFriend");
```

### DELETE - Menghapus User Preferences

```javascript
/**
 * Menghapus user preferences
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function deleteUserPreferences(userId = null) {
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

// Example usage:
// await deleteUserPreferences();
```

---

## 4. COLLECTION: userStatistics

### CREATE - Menambahkan User Statistics

```javascript
/**
 * Menambahkan atau update user statistics (menggunakan userId sebagai document ID)
 * @param {Object} stats - Statistics {totalGames, totalWins, totalDraws, totalLosses, bestTime, averageGameTime}
 * @returns {Promise<string|null>} ID dokumen (userId) atau null jika error
 */
async function saveUserStatistics(stats) {
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

// Example usage:
// await saveUserStatistics({
//   totalGames: 10,
//   totalWins: 5,
//   totalDraws: 2,
//   totalLosses: 3,
//   bestTime: 30,
//   averageGameTime: 45
// });
```

### READ - Membaca User Statistics

```javascript
/**
 * Membaca user statistics dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Object|null>} Data statistics atau null jika tidak ditemukan
 */
async function getUserStatistics(userId = null) {
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

// Example usage:
// const stats = await getUserStatistics();
```

### UPDATE - Memperbarui User Statistics

```javascript
/**
 * Increment total games
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function incrementTotalGames() {
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
 * Increment win count
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function incrementWins() {
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
 * Update best time jika waktu baru lebih cepat
 * @param {number} newTime - Waktu baru dalam detik
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function updateBestTime(newTime) {
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
      await updateDoc(userStatsRef, {
        bestTime: newTime,
        lastUpdated: serverTimestamp(),
      });
      console.log("Best time berhasil diupdate!");
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error mengupdate best time:", error);
    return false;
  }
}

// Example usage:
// await incrementTotalGames();
// await incrementWins();
// await updateBestTime(25);
```

### DELETE - Menghapus User Statistics

```javascript
/**
 * Menghapus user statistics
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function deleteUserStatistics(userId = null) {
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

// Example usage:
// await deleteUserStatistics();
```

---

## 5. COLLECTION: sessions

### CREATE - Menambahkan Session Data

```javascript
/**
 * Menambahkan session data baru
 * @param {Object} sessionData - Session data {startTime, endTime, totalGames, totalTime}
 * @returns {Promise<string|null>} ID dokumen atau null jika error
 */
async function addSessionData(sessionData) {
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

// Example usage:
// await addSessionData({
//   startTime: new Date(),
//   endTime: null,
//   totalGames: 5,
//   totalTime: 300
// });
```

### READ - Membaca Session Data

```javascript
/**
 * Membaca session data berdasarkan ID
 * @param {string} sessionId - ID dokumen session
 * @returns {Promise<Object|null>} Data session atau null jika tidak ditemukan
 */
async function getSessionById(sessionId) {
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
 * Membaca semua session dari user tertentu
 * @param {string} userId - ID user (optional, default: current user)
 * @returns {Promise<Array>} Array of session documents
 */
async function getUserSessions(userId = null) {
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

// Example usage:
// const session = await getSessionById("some-session-id");
// const mySessions = await getUserSessions();
```

### UPDATE - Memperbarui Session Data

```javascript
/**
 * Memperbarui endTime dari session (menutup session)
 * @param {string} sessionId - ID dokumen session
 * @param {Date} endTime - Waktu session berakhir
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function closeSession(sessionId, endTime) {
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
 * Increment total games dalam session
 * @param {string} sessionId - ID dokumen session
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function incrementSessionGames(sessionId) {
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

// Example usage:
// await closeSession("some-session-id", new Date());
// await incrementSessionGames("some-session-id");
```

### DELETE - Menghapus Session Data

```javascript
/**
 * Menghapus session data
 * @param {string} sessionId - ID dokumen session yang akan dihapus
 * @returns {Promise<boolean>} true jika berhasil, false jika error
 */
async function deleteSession(sessionId) {
  try {
    await deleteDoc(doc(db, "sessions", sessionId));
    console.log("Session berhasil dihapus!");
    return true;
  } catch (error) {
    console.error("Error menghapus session:", error);
    return false;
  }
}

// Example usage:
// await deleteSession("some-session-id");
```

---

## Tips dan Best Practices

1. **Error Handling**: Selalu gunakan try-catch untuk menangani error
2. **Authentication Check**: Pastikan user sudah login sebelum melakukan operasi write
3. **Server Timestamp**: Gunakan `serverTimestamp()` untuk timestamp yang konsisten
4. **Array Operations**: Gunakan `arrayUnion()` dan `arrayRemove()` untuk operasi array
5. **Numeric Operations**: Gunakan `increment()` untuk operasi numerik atomik
6. **Merge Documents**: Gunakan `{ merge: true }` dengan `setDoc()` untuk update partial
7. **Query Optimization**: Buat index yang diperlukan untuk query yang kompleks
8. **Security Rules**: Pastikan security rules sudah dikonfigurasi dengan benar

---

## Real-time Updates (Opsional)

Untuk real-time updates, gunakan `onSnapshot()`:

```javascript
import { onSnapshot } from "firebase/firestore";

// Listen untuk perubahan real-time pada leaderboard
const unsubscribe = onSnapshot(
  query(
    collection(db, "leaderboard"),
    orderBy("humanScore", "desc"),
    limit(10)
  ),
  (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === "added") {
        console.log("New score:", change.doc.data());
      }
      if (change.type === "modified") {
        console.log("Modified score:", change.doc.data());
      }
      if (change.type === "removed") {
        console.log("Removed score:", change.doc.data());
      }
    });
  }
);

// Unsubscribe ketika tidak diperlukan lagi
// unsubscribe();
```

---

## Batched Writes dan Transactions

Untuk operasi yang memerlukan atomicity, gunakan batched writes atau transactions:

```javascript
import { writeBatch, runTransaction } from "firebase/firestore";

// Batched Write Example
async function saveGameDataWithHistory(scoreData, historyData) {
  try {
    const batch = writeBatch(db);

    // Add score
    const scoreRef = doc(collection(db, "leaderboard"));
    batch.set(scoreRef, scoreData);

    // Add history (with gameId reference)
    const historyRef = doc(collection(db, "gameHistory"));
    batch.set(historyRef, {
      ...historyData,
      gameId: scoreRef.id,
    });

    // Commit batch
    await batch.commit();
    console.log("Game data dan history berhasil disimpan!");
  } catch (error) {
    console.error("Error dalam batched write:", error);
  }
}

// Transaction Example
async function updateStatisticsAtomically(userId, newGameResult) {
  try {
    await runTransaction(db, async (transaction) => {
      const statsRef = doc(db, "userStatistics", userId);
      const statsDoc = await transaction.get(statsRef);

      if (!statsDoc.exists()) {
        throw "Document does not exist!";
      }

      const currentStats = statsDoc.data();
      const newStats = {
        totalGames: (currentStats.totalGames || 0) + 1,
        totalWins:
          newGameResult === "win"
            ? (currentStats.totalWins || 0) + 1
            : currentStats.totalWins || 0,
        // ... update lainnya
      };

      transaction.update(statsRef, newStats);
    });
    console.log("Statistics berhasil diupdate!");
  } catch (error) {
    console.error("Error dalam transaction:", error);
  }
}
```

---

Selamat coding! 🚀
