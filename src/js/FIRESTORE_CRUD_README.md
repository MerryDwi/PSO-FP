# Firestore CRUD Operations - Dokumentasi

File `firestoreCRUD.js` berisi implementasi lengkap CRUD operations untuk Firestore berdasarkan konfigurasi dari `firebase.config.js`.

## Setup

File ini menggunakan konfigurasi Firebase dari `firebase.config.js`:

- **Project ID**: `pso-fp-aci5ba`
- **Collections**: leaderboard, gameHistory, userPreferences, userStatistics, sessions

## Import

```javascript
import {
  // Leaderboard functions
  addScoreToLeaderboard,
  getLeaderboard,
  getScoreById,
  getUserScores,
  updateScoreResult,
  deleteScore,

  // Game History functions
  addGameHistory,
  getGameHistoryById,
  getUserGameHistory,

  // User Preferences functions
  saveUserPreferences,
  getUserPreferences,
  updateUserTheme,

  // User Statistics functions
  saveUserStatistics,
  getUserStatistics,
  incrementTotalGames,

  // Sessions functions
  addSessionData,
  getUserSessions,

  // Advanced functions
  saveGameDataWithHistory,
  updateStatisticsAtomically,

  // Export db dan auth jika diperlukan
  db,
  auth,
} from "./firestoreCRUD.js";
```

## Collections

### 1. leaderboard

Menyimpan score setiap game yang dimainkan user melawan komputer.

**Fungsi yang tersedia:**

- `addScoreToLeaderboard(humanScore, computerScore, gameTime, result, additionalData)`
- `getLeaderboard(limitCount = 10)`
- `getScoreById(scoreId)`
- `getUserScores(userId = null)`
- `updateScoreResult(scoreId, newResult)`
- `updateScoreGameTime(scoreId, newGameTime)`
- `deleteScore(scoreId)`
- `removeScoreField(scoreId, fieldName)`

### 2. gameHistory

Menyimpan detail history game dengan semua moves yang dilakukan.

**Fungsi yang tersedia:**

- `addGameHistory(moves, boardState, gameId)`
- `getGameHistoryById(historyId)`
- `getUserGameHistory(userId = null)`
- `getGameHistoryByGameId(gameId)`
- `addMoveToHistory(historyId, newMove)`
- `updateHistoryBoardState(historyId, newBoardState)`
- `deleteGameHistory(historyId)`

### 3. userPreferences

Menyimpan preferensi user (document ID = userId).

**Fungsi yang tersedia:**

- `saveUserPreferences(preferences)`
- `getUserPreferences(userId = null)`
- `updateUserTheme(theme)`
- `updateUserGameMode(gameMode)`
- `deleteUserPreferences(userId = null)`

### 4. userStatistics

Menyimpan statistik agregat user (document ID = userId).

**Fungsi yang tersedia:**

- `saveUserStatistics(stats)`
- `getUserStatistics(userId = null)`
- `incrementTotalGames()`
- `incrementWins()`
- `updateBestTime(newTime)`
- `deleteUserStatistics(userId = null)`

### 5. sessions

Menyimpan data session user.

**Fungsi yang tersedia:**

- `addSessionData(sessionData)`
- `getSessionById(sessionId)`
- `getUserSessions(userId = null)`
- `closeSession(sessionId, endTime)`
- `incrementSessionGames(sessionId)`
- `deleteSession(sessionId)`

## Advanced Operations

### Batched Writes

Menyimpan multiple documents secara atomik:

```javascript
import { saveGameDataWithHistory } from "./firestoreCRUD.js";

await saveGameDataWithHistory(scoreData, historyData);
```

### Transactions

Update data secara atomik dengan rollback jika error:

```javascript
import { updateStatisticsAtomically } from "./firestoreCRUD.js";

await updateStatisticsAtomically(userId, "win");
```

## Contoh Penggunaan

Lihat file `firestoreCRUD.example.js` untuk contoh penggunaan lengkap.

### Contoh Sederhana

```javascript
import { addScoreToLeaderboard, getLeaderboard } from "./firestoreCRUD.js";

// Tambah score
const scoreId = await addScoreToLeaderboard(2, 1, 45, "win");

// Baca leaderboard
const leaderboard = await getLeaderboard(10);
console.log(leaderboard);
```

### Contoh Workflow Lengkap

```javascript
import {
  addScoreToLeaderboard,
  addGameHistory,
  incrementTotalGames,
  incrementWins,
} from "./firestoreCRUD.js";

// 1. Simpan score
const scoreId = await addScoreToLeaderboard(2, 1, 45, "win");

// 2. Simpan history
const moves = [
  { player: "X", position: 0, timestamp: new Date().toISOString() },
];
const boardState = ["X", "", "", "", "", "", "", "", ""];
await addGameHistory(moves, boardState, scoreId);

// 3. Update statistics
await incrementTotalGames();
await incrementWins();
```

## Error Handling

Semua fungsi sudah memiliki error handling internal dan akan:

- Return `null` atau `false` jika terjadi error
- Log error ke console
- Tidak throw error (safe untuk digunakan tanpa try-catch)

Jika ingin custom error handling:

```javascript
try {
  const scoreId = await addScoreToLeaderboard(2, 1, 45, "win");
  if (!scoreId) {
    // Handle error
  }
} catch (error) {
  // Handle unexpected error
}
```

## Authentication

Semua fungsi write operations memerlukan user yang sudah login. Fungsi akan:

- Check `auth.currentUser`
- Return `null` atau `false` jika user belum login
- Log warning ke console

## Notes

1. **Server Timestamp**: Semua timestamp menggunakan `serverTimestamp()` untuk konsistensi
2. **Document ID**: `userPreferences` dan `userStatistics` menggunakan `userId` sebagai document ID
3. **Array Operations**: Gunakan `arrayUnion()` dan `arrayRemove()` untuk operasi array
4. **Numeric Operations**: Gunakan `increment()` untuk operasi numerik atomik
5. **Index**: Pastikan index sudah dibuat di Firebase Console untuk query yang kompleks

## Lihat Juga

- `FIRESTORE_CRUD_OPERATIONS.md` - Dokumentasi lengkap dengan semua contoh
- `FIRESTORE_CRUD_QUICK_REFERENCE.md` - Quick reference guide
- `firestoreCRUD.example.js` - Contoh penggunaan lengkap
