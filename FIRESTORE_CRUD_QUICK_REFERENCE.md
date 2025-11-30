# Firestore CRUD Operations - Quick Reference

Quick reference untuk operasi CRUD Firestore pada aplikasi Tic-Tac-Toe.

## Setup

```javascript
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
  FieldValue,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

const db = getFirestore(app);
const auth = getAuth(app);
```

---

## 1. LEADERBOARD Collection

### CREATE

```javascript
// Add score dengan auto-generated ID
const docRef = await addDoc(collection(db, "leaderboard"), {
  userId: user.uid,
  userEmail: user.email,
  humanScore: 2,
  computerScore: 1,
  gameTime: 45,
  result: "win",
  timestamp: serverTimestamp(),
  // ... fields lainnya
});
```

### READ

```javascript
// Get all leaderboard (sorted by humanScore desc)
const q = query(
  collection(db, "leaderboard"),
  orderBy("humanScore", "desc"),
  limit(10)
);
const snapshot = await getDocs(q);

// Get by ID
const docSnap = await getDoc(doc(db, "leaderboard", "score-id"));

// Get by userId
const q = query(collection(db, "leaderboard"), where("userId", "==", userId));
```

### UPDATE

```javascript
await updateDoc(doc(db, "leaderboard", "score-id"), {
  result: "win",
  timestamp: serverTimestamp(),
});
```

### DELETE

```javascript
await deleteDoc(doc(db, "leaderboard", "score-id"));
```

---

## 2. GAMEHISTORY Collection

### CREATE

```javascript
await addDoc(collection(db, "gameHistory"), {
  userId: user.uid,
  gameId: "leaderboard-doc-id",
  moves: [{ player: "X", position: 0, timestamp: "..." }],
  boardState: ["X", "", "", "", "", "", "", "", ""],
  moveCount: 1,
  timestamp: serverTimestamp(),
});
```

### READ

```javascript
// Get by gameId
const q = query(collection(db, "gameHistory"), where("gameId", "==", gameId));
const snapshot = await getDocs(q);

// Get by userId
const q = query(collection(db, "gameHistory"), where("userId", "==", userId));
```

### UPDATE

```javascript
// Add move to array
await updateDoc(doc(db, "gameHistory", "history-id"), {
  moves: arrayUnion(newMove),
  moveCount: increment(1),
});
```

### DELETE

```javascript
await deleteDoc(doc(db, "gameHistory", "history-id"));
```

---

## 3. USERPREFERENCES Collection

### CREATE/UPDATE (menggunakan userId sebagai doc ID)

```javascript
await setDoc(
  doc(db, "userPreferences", user.uid),
  {
    userId: user.uid,
    preferences: { theme: "dark", gameMode: "playerVsComputer" },
    lastUpdated: serverTimestamp(),
  },
  { merge: true }
);
```

### READ

```javascript
const docSnap = await getDoc(doc(db, "userPreferences", user.uid));
```

### UPDATE (partial)

```javascript
await updateDoc(doc(db, "userPreferences", user.uid), {
  "preferences.theme": "dark",
  lastUpdated: serverTimestamp(),
});
```

### DELETE

```javascript
await deleteDoc(doc(db, "userPreferences", user.uid));
```

---

## 4. USERSTATISTICS Collection

### CREATE/UPDATE (menggunakan userId sebagai doc ID)

```javascript
await setDoc(
  doc(db, "userStatistics", user.uid),
  {
    userId: user.uid,
    totalGames: 10,
    totalWins: 5,
    totalDraws: 2,
    totalLosses: 3,
    bestTime: 30,
    averageGameTime: 45,
    lastUpdated: serverTimestamp(),
  },
  { merge: true }
);
```

### READ

```javascript
const docSnap = await getDoc(doc(db, "userStatistics", user.uid));
```

### UPDATE (increment)

```javascript
await updateDoc(doc(db, "userStatistics", user.uid), {
  totalGames: increment(1),
  totalWins: increment(1),
  lastUpdated: serverTimestamp(),
});
```

### DELETE

```javascript
await deleteDoc(doc(db, "userStatistics", user.uid));
```

---

## 5. SESSIONS Collection

### CREATE

```javascript
await addDoc(collection(db, "sessions"), {
  userId: user.uid,
  startTime: new Date(),
  endTime: null,
  totalGames: 0,
  totalTime: 0,
  timestamp: serverTimestamp(),
});
```

### READ

```javascript
// Get by userId
const q = query(collection(db, "sessions"), where("userId", "==", userId));
const snapshot = await getDocs(q);
```

### UPDATE

```javascript
await updateDoc(doc(db, "sessions", "session-id"), {
  endTime: new Date(),
  totalGames: increment(1),
  timestamp: serverTimestamp(),
});
```

### DELETE

```javascript
await deleteDoc(doc(db, "sessions", "session-id"));
```

---

## Common Patterns

### Check Authentication

```javascript
const user = auth.currentUser;
if (!user) {
  console.warn("User belum login");
  return null;
}
```

### Error Handling

```javascript
try {
  // Firestore operation
} catch (error) {
  console.error("Error:", error);
  return null;
}
```

### Real-time Listener

```javascript
import { onSnapshot } from "firebase/firestore";

const unsubscribe = onSnapshot(
  query(collection(db, "leaderboard"), orderBy("humanScore", "desc")),
  (snapshot) => {
    snapshot.forEach((doc) => {
      console.log(doc.id, "=>", doc.data());
    });
  }
);

// Unsubscribe: unsubscribe();
```

### Batched Write

```javascript
import { writeBatch } from "firebase/firestore";

const batch = writeBatch(db);
batch.set(doc(db, "leaderboard", "id1"), data1);
batch.set(doc(db, "gameHistory", "id2"), data2);
await batch.commit();
```

### Transaction

```javascript
import { runTransaction } from "firebase/firestore";

await runTransaction(db, async (transaction) => {
  const docRef = doc(db, "userStatistics", userId);
  const docSnap = await transaction.get(docRef);
  // ... update logic
  transaction.update(docRef, newData);
});
```

---

## Field Operations

### Array Operations

```javascript
// Add to array
arrayUnion(newItem);

// Remove from array
arrayRemove(item);

// Example
await updateDoc(docRef, {
  tags: arrayUnion("new-tag"),
  items: arrayRemove("old-item"),
});
```

### Numeric Operations

```javascript
// Increment
increment(1);

// Decrement
increment(-1);

// Example
await updateDoc(docRef, {
  count: increment(1),
  score: increment(-5),
});
```

### Delete Field

```javascript
deleteField();

// Example
await updateDoc(docRef, {
  oldField: deleteField(),
});
```

### Server Timestamp

```javascript
serverTimestamp();

// Example
await updateDoc(docRef, {
  updatedAt: serverTimestamp(),
});
```

---

## Query Examples

### Simple Query

```javascript
const q = query(collection(db, "leaderboard"), where("result", "==", "win"));
```

### Multiple Conditions

```javascript
const q = query(
  collection(db, "leaderboard"),
  where("userId", "==", userId),
  where("result", "==", "win"),
  orderBy("timestamp", "desc"),
  limit(10)
);
```

### Range Query

```javascript
const q = query(
  collection(db, "leaderboard"),
  where("gameTime", ">=", 30),
  where("gameTime", "<=", 60)
);
```

---

**Note**: Pastikan index sudah dibuat di Firebase Console untuk query yang kompleks!
