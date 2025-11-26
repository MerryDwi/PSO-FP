````markdown
# 🕹️ Tiny Tactics

Tiny Tactics adalah game papan strategis 3x3 berbasis web yang terinspirasi dari klasik tic-tac-toe. Dibangun menggunakan JavaScript, HTML, dan CSS modern, game ini menawarkan dua mode utama: bermain melawan teman (lokal) atau menantang lawan komputer (AI dasar).

![Tiny Tactics Screenshot](https://github.com/user-attachments/assets/e4b11811-0f60-4aee-a330-8cb7b3f6bbae)

---

## ✨ Fitur Utama

- **2 Mode Permainan:**
  - Pemain vs Pemain (local two-player).
  - Pemain vs Komputer (AI dasar).
- **Sistem Skoring Otomatis:** Skor kedua pemain dilacak sepanjang sesi dan dapat diatur ulang kapan saja.
- **Highlight dan Animasi Kemenangan:** Sel (kotak) yang membentuk garis kemenangan akan disorot dan dianinasikan untuk umpan balik visual yang jelas.
- **Tema Terang/Gelap (Dark/Light Theme):** Pengguna dapat beralih antara mode gelap dan terang sesuai preferensi.
- **Efek Suara Interaktif:** Menyediakan umpan balik audio untuk aksi kunci (menang, kalah, seri).
- **Latar Belakang Dinamis:** Latar belakang visual yang menarik dan interaktif untuk pengalaman mendalam.
- **Tombol Restart & Reset Skor:** Memudahkan untuk memulai ulang permainan atau mengatur ulang skor kapan saja.

---

## 🛠️ Infrastruktur dan Tools DevOps

Proyek ini mengadopsi serangkaian alat modern untuk mengotomatisasi dan menyederhanakan pengembangan, pengujian, deployment, dan pemantauan.

| Kategori          | Alat                              | Deskripsi                                                                                                         |
| :---------------- | :-------------------------------- | :---------------------------------------------------------------------------------------------------------------- |
| **Pengembangan**  | Visual Studio Code (VS Code)      | Editor utama untuk fleksibilitas dan ekosistem ekstensinya.                                                       |
| **Versi Kontrol** | GitHub                            | Pusat manajemen kode sumber, pelacakan, dan _code review_.                                                        |
| **CI/CD**         | GitHub Actions                    | Mengotomatiskan Continuous Integration/Continuous Deployment.                                                     |
| **Kualitas Kode** | ESLint, SonarCloud                | Memastikan kualitas dan keamanan kode JavaScript melalui analisis statis dan code quality gates.                  |
| **Pengujian**     | Jest (dengan Coverage)            | Menyediakan pengujian unit yang cepat dan tangguh untuk logika game, AI, dan perilaku UI dengan laporan coverage. |
| **Keamanan**      | npm audit, Snyk                   | Memindai kerentanan ketergantungan dengan tingkat audit tinggi dan security scanning.                             |
| **Git Hooks**     | Husky, lint-staged                | Pre-commit dan pre-push hooks untuk memastikan kode berkualitas sebelum commit/push.                              |
| **Code Coverage** | Jest Coverage, Codecov            | Pelacakan dan pelaporan code coverage dengan threshold minimum 70%.                                               |
| **Deployment**    | Vercel                            | Platform hosting untuk aplikasi _front-end_ dan deployment otomatis.                                              |
| **Monitoring**    | Vercel Analytics & Speed Insights | Skrip tersemat untuk metrik kinerja dan penggunaan _real-time_.                                                   |

**Link Aplikasi Live:** [https://fp-pso-umber.vercel.app/](https://fp-pso-umber.vercel.app/)

---

## 🧩 Struktur Proyek

---

## 🛠️ DevOps CI/CD Workflow Architecture

Proyek ini menerapkan pipeline DevOps modern untuk memastikan proses pengembangan, pengujian, dan deployment berjalan otomatis dan terintegrasi. Berikut adalah arsitektur workflow yang digunakan:

![Workflow Architecture](./workflow-architecture.png)

**Penjelasan Alur:**

1. **Feature Development**

   - Desain UI/UX dibuat di Figma.
   - Implementasi fitur dilakukan di VS Code.
   - Data aplikasi tersimpan di Firebase Database.

2. **Pre-Commit Hooks (Husky)**

   - Sebelum commit, Husky otomatis menjalankan:
     - Lint-staged (linting file yang diubah)
     - Unit tests
   - Mencegah kode berkualitas rendah masuk ke repository

3. **Continuous Integration (CI)**

   - Kode di-push ke repository GitHub.
   - GitHub Actions CI otomatis menjalankan:
     - **Lint** - ESLint untuk code quality
     - **Unit Test dengan Coverage** - Jest dengan laporan coverage (threshold 70%)
     - **SonarCloud Analysis** - Analisis kualitas kode mendalam
     - **Security Scan** - Snyk untuk vulnerability scanning
     - **Code Coverage Upload** - Upload ke Codecov untuk tracking
     - Build verification

4. **Continuous Delivery (CD)**

   - Setelah CI sukses dan quality gate passed, pipeline CD berjalan:
     - Quality gate check final
     - Build & Deploy ke Vercel (Production)
     - Deployment summary generation
     - Sinkronisasi data/hosting ke Firebase

5. **Code Quality Monitoring**
   - Weekly quality reports (setiap Senin)
   - Coverage reports dengan format HTML, LCOV, JSON, dan JSON Summary
   - Automated quality metrics tracking
   - Coverage artifacts tersimpan selama 30 hari

---

PSO-FP/
├── index.html # Halaman utama (Sign In/Sign Up)
├── game.html # Halaman utama game X O
├── src/
│ ├── js/
│ │ ├── script.js # Logika utama game (UI, event, integrasi logic)
│ │ ├── gameLogic.js # Pure logic Tic Tac Toe (untuk test & browser)
│ │ └── auth.js # Logika otentikasi (Sign In/Up)
│ ├── css/
│ │ ├── style.css # Gaya utama game
│ │ └── auth.css # Gaya untuk halaman autentikasi
│ ├── images/ # Logo dan gambar
│ └── sounds/ # Efek suara (win.mp3, lose.mp3, draw.mp3, dst)
├── **tests**/
│ └── game.test.js # Unit & UI tests (Jest)
├── .github/
│ └── workflows/
│ ├── ci.yml # Pipeline Continuous Integration (lint, test, audit, sonarcloud, security)
│ ├── cd.yml # Pipeline Continuous Deployment (deploy ke Vercel dengan quality gate)
│ └── code-quality.yml # Weekly quality reports
├── .husky/
│ ├── pre-commit # Git hook untuk lint & test sebelum commit
│ └── pre-push # Git hook untuk lint & coverage sebelum push
├── sonar-project.properties # Konfigurasi SonarCloud
├── .lintstagedrc.js # Konfigurasi lint-staged untuk pre-commit
├── package.json # Konfigurasi npm & dependencies
├── eslint.config.mjs # Konfigurasi ESLint
├── babel.config.js # Konfigurasi Babel
└── jest.config.js # Konfigurasi Jest

### Catatan Struktur & Modularisasi

- **gameLogic.js**: Berisi seluruh logic murni (checkWinner, checkDraw, findBestMove) yang bisa di-import langsung oleh Jest untuk unit test, maupun diakses window untuk browser statis.
- **script.js**: Berisi integrasi logic, event handler, dan UI DOM. Untuk kebutuhan test, diekspor dengan `module.exports` agar Jest dapat mengakses fungsi dan variabel penting.
- **Testing**: Kini mendukung test logic murni (langsung ke gameLogic.js) dan test UI/event (melalui script.js dengan mock DOM).

---

## 🚀 Cara Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk mengatur dan menjalankan Tiny Tactics secara lokal.

### Persyaratan Sistem

- **Node.js** (v18+)
- **npm** (Node Package Manager)
- **Git**
- **Web Browser**
- **VS Code Live Server Extension** (Opsional, direkomendasikan untuk pengembangan lokal)

### Langkah-Langkah Instalasi

1.  **Clone repositori:**
    ```sh
    git clone [https://github.com/maulinanl/fp-pso.git](https://github.com/maulinanl/fp-pso.git)
    ```
2.  **Masuk ke direktori proyek:**
    ```sh
    cd fp-pso
    ```
3.  **Instal dependencies:**
    ```sh
    npm install
    ```

### Menjalankan Secara Lokal

1.  Buka proyek di Visual Studio Code.
2.  Klik kanan pada file `index.html` (atau `game.html` jika ingin langsung ke game).
3.  Pilih **"Open with Live Server"** (memerlukan ekstensi Live Server).
4.  Aplikasi akan berjalan di `localhost` browser Anda.

### Menjalankan Tes & Lint

- **Jalankan Tes Unit (Jest):**

  ```sh
  npm test
  ```

- **Jalankan Tes dengan Coverage:**

  ```sh
  npm run test:coverage
  ```

- **Jalankan Pemeriksaan Lint (ESLint):**

  ```sh
  npm run lint
  ```

- **Jalankan Lint untuk Semua File:**

  ```sh
  npm run lint:all
  ```

- **Fix Lint Issues Otomatis:**
  ```sh
  npm run lint:fix
  ```

---

## 🔧 Konfigurasi CI/CD Lanjutan

### Setup SonarCloud

1. **Daftar di SonarCloud** (https://sonarcloud.io)
2. **Buat project baru** dan dapatkan:
   - Organization Key
   - Project Key
3. **Update `sonar-project.properties`** dengan keys Anda
4. **Tambahkan secrets di GitHub:**
   - `SONAR_TOKEN` - Token dari SonarCloud

### Setup Snyk Security Scanning

1. **Daftar di Snyk** (https://snyk.io)
2. **Tambahkan secrets di GitHub:**
   - `SNYK_TOKEN` - Token dari Snyk dashboard

### Setup Codecov

1. **Daftar di Codecov** (https://codecov.io)
2. **Hubungkan repository GitHub** Anda
3. Codecov akan otomatis menerima coverage reports dari CI

### Setup Husky (Pre-commit Hooks)

Setelah `npm install`, Husky akan otomatis terinstall. Untuk setup manual:

```sh
npm run prepare
```

Hooks yang tersedia:

- **pre-commit**: Menjalankan lint-staged dan tests
- **pre-push**: Menjalankan lint:all dan test:coverage

### GitHub Secrets yang Diperlukan

Tambahkan secrets berikut di GitHub Repository Settings → Secrets:

| Secret Name         | Deskripsi                          | Sumber               |
| ------------------- | ---------------------------------- | -------------------- |
| `SONAR_TOKEN`       | Token untuk SonarCloud analysis    | SonarCloud Dashboard |
| `SNYK_TOKEN`        | Token untuk Snyk security scanning | Snyk Dashboard       |
| `VERCEL_TOKEN`      | Token untuk deployment Vercel      | Vercel Dashboard     |
| `VERCEL_ORG_ID`     | Organization ID Vercel             | Vercel Dashboard     |
| `VERCEL_PROJECT_ID` | Project ID Vercel                  | Vercel Dashboard     |

### Coverage Threshold

Proyek ini menggunakan coverage threshold minimum **70%** untuk:

- Branches
- Functions
- Lines
- Statements

Threshold dapat disesuaikan di `jest.config.js`.

**Format Coverage Reports:**

Jest menghasilkan coverage reports dalam beberapa format:

- **text** - Output terminal
- **lcov** - Format untuk Codecov dan tools eksternal
- **html** - Laporan interaktif (buka `coverage/index.html`)
- **json** - Data coverage dalam format JSON
- **json-summary** - Ringkasan coverage untuk integrasi dengan tools lain

Semua format tersedia di direktori `coverage/` setelah menjalankan `npm run test:coverage`.

---

## 👨‍💻 Dikembangkan Oleh

- Putri Salsabilla Insani
- Qoyyimil Jamilah
- Maulina Nur Laila
- Awwaliyah Aliyah

**Dokumentasi Proyek Lengkap:** [https://its.id/m/PSO-Docs-Group2](https://its.id/m/PSO-Docs-Group2)

```

```
````
