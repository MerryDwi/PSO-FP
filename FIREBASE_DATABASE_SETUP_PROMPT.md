# Prompt Setup Database Firebase Firestore untuk Gemini

## Prompt untuk Gemini Firebase:

**KONTEKS**: Ini adalah setup BACKEND/DATABASE saja untuk aplikasi game Tic-Tac-Toe yang menggunakan Firebase Firestore. Hanya perlu setup struktur database Firestore dengan collections dan security rules, tidak termasuk frontend atau kode aplikasi.

```
Saya memiliki aplikasi game Tic-Tac-Toe yang menggunakan Firebase Firestore.
Saya perlu setup struktur database Firestore dengan collections dan security rules berikut (BACKEND/DATABASE SETUP SAJA):

## PROJECT DETAILS:
- Project ID: pso-fp-aci5ba
- Aplikasi: Game Tic-Tac-Toe dengan fitur leaderboard, game history, user statistics, dan user preferences

## COLLECTIONS YANG DIPERLUKAN:

### 1. Collection: leaderboard
**Deskripsi**: Menyimpan score setiap game yang dimainkan user melawan komputer

**Struktur Document**:
- userId (string) - ID user dari Firebase Auth
- userEmail (string) - Email user
- humanScore (number) - Score player (X) pada game ini
- computerScore (number) - Score computer (O) pada game ini
- gameTime (number) - Waktu permainan dalam detik
- result (string) - Hasil game: 'win', 'lose', atau 'draw'
- timestamp (timestamp) - Waktu game selesai (serverTimestamp)
- gameMode (string) - Mode game: 'playerVsComputer'
- resetTimestampISO (string) - ISO timestamp untuk grouping per session
- currentScores (object) - Score saat ini:
  - scoreX (number)
  - scoreO (number)
  - scoreDraw (number)
- userPreferences (object) - Preferensi user:
  - theme (string) - 'light' atau 'dark'
  - gameMode (string)
- gameState (object|null) - State game:
  - currentPlayer (string)
  - gameOver (boolean)
- deviceInfo (object) - Info device:
  - userAgent (string)
  - platform (string)
  - language (string)

**Index yang diperlukan**:
- Index pada field: humanScore (descending) untuk query leaderboard

### 2. Collection: gameHistory
**Deskripsi**: Menyimpan detail history game dengan semua moves yang dilakukan

**Struktur Document**:
- userId (string) - ID user dari Firebase Auth
- userEmail (string) - Email user
- gameId (string) - ID dari document leaderboard yang terkait
- moves (array) - Array of move objects:
  - player (string) - 'X' atau 'O'
  - position (number) - Posisi cell (0-8)
  - timestamp (string) - ISO timestamp
- boardState (array) - Final board state [9 elements: 'X', 'O', atau '']
- timestamp (timestamp) - Waktu history disimpan (serverTimestamp)
- moveCount (number) - Jumlah total moves

### 3. Collection: userPreferences
**Deskripsi**: Menyimpan preferensi user (document ID = userId)

**Struktur Document**:
- userId (string) - ID user dari Firebase Auth (juga sebagai document ID)
- userEmail (string) - Email user
- preferences (object) - Preferensi user:
  - theme (string) - 'light' atau 'dark'
  - gameMode (string) - Mode game yang dipilih
- lastUpdated (timestamp) - Waktu terakhir diupdate (serverTimestamp)

### 4. Collection: userStatistics
**Deskripsi**: Menyimpan statistik agregat user (document ID = userId)

**Struktur Document**:
- userId (string) - ID user dari Firebase Auth (juga sebagai document ID)
- userEmail (string) - Email user
- totalGames (number) - Total game yang dimainkan
- totalWins (number) - Total kemenangan
- totalDraws (number) - Total seri
- totalLosses (number) - Total kekalahan
- bestTime (number|null) - Waktu tercepat menang (dalam detik)
- averageGameTime (number) - Rata-rata waktu permainan
- lastUpdated (timestamp) - Waktu terakhir diupdate (serverTimestamp)

### 5. Collection: sessions
**Deskripsi**: Menyimpan data session user

**Struktur Document**:
- userId (string) - ID user dari Firebase Auth
- userEmail (string) - Email user
- startTime (timestamp) - Waktu session dimulai
- endTime (timestamp|null) - Waktu session berakhir
- totalGames (number) - Total game dalam session ini
- totalTime (number) - Total waktu bermain dalam detik
- timestamp (timestamp) - Waktu data disimpan (serverTimestamp)

## SECURITY RULES YANG DIPERLUKAN:

Buatkan Firestore Security Rules dengan ketentuan:
1. User harus authenticated untuk read/write data
2. User hanya bisa read/write data miliknya sendiri (userId match)
3. Untuk leaderboard collection, user bisa read semua data (untuk melihat leaderboard) tapi hanya bisa write data miliknya
4. Untuk gameHistory, user hanya bisa read/write data miliknya
5. Untuk userPreferences dan userStatistics, user hanya bisa read/write data miliknya (document ID = userId)
6. Untuk sessions, user hanya bisa read/write data miliknya

## TUGAS (BACKEND/DATABASE SETUP SAJA):
1. Buatkan struktur Firestore database dengan 5 collections di atas
2. Buatkan Firestore Security Rules yang sesuai
3. Buatkan index yang diperlukan untuk query leaderboard (humanScore descending)
4. Berikan instruksi langkah-langkah setup di Firebase Console

**CATATAN**: Hanya membutuhkan setup backend/database Firebase Firestore saja. Tidak perlu membuat kode frontend, API endpoints, atau komponen aplikasi lainnya. Hanya fokus pada struktur database, security rules, dan index yang diperlukan.

Mohon buatkan setup database yang lengkap dan siap digunakan untuk aplikasi game Tic-Tac-Toe ini.
```

## Catatan Penggunaan:

1. Copy prompt di atas ke Gemini Firebase
2. Gemini akan membantu membuat struktur database dan security rules
3. Ikuti instruksi yang diberikan untuk setup di Firebase Console
4. Pastikan untuk membuat index yang diperlukan jika muncul error saat query

## Struktur Data Tambahan:

Jika perlu menambahkan field baru di masa depan, pastikan untuk:

- Update security rules jika diperlukan
- Update index jika query baru memerlukan index
- Update dokumentasi struktur database
