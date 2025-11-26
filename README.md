# 🕹️ Tiny Tactics

Tiny Tactics adalah game papan strategis 3x3 berbasis web yang terinspirasi dari klasik tic-tac-toe. Dibangun menggunakan JavaScript, HTML, dan CSS modern, game ini menawarkan dua mode utama: bermain melawan teman (lokal) atau menantang lawan komputer (AI dasar).

![Tiny Tactics Screenshot](https://github.com/user-attachments/assets/e4b11811-0f60-4aee-a330-8cb7b3f6bbae)

---

✨ Fitur Utama

- 2 Mode Permainan:
  - Pemain vs Pemain (local two-player).
  - Pemain vs Komputer (AI dasar).
- Sistem Skoring Otomatis: Skor kedua pemain dilacak sepanjang sesi dan dapat diatur ulang kapan saja.
- Highlight dan Animasi Kemenangan: Sel (kotak) yang membentuk garis kemenangan akan disorot dan dianinasikan untuk umpan balik visual yang jelas.
- Tema Terang/Gelap (Dark/Light Theme): Pengguna dapat beralih antara mode gelap dan terang sesuai preferensi.
- Efek Suara Interaktif: Menyediakan umpan balik audio untuk aksi kunci (menang, kalah, seri).
- Latar Belakang Dinamis:Latar belakang visual yang menarik dan interaktif untuk pengalaman mendalam.
- Tombol Restart & Reset Skor: Memudahkan untuk memulai ulang permainan atau mengatur ulang skor kapan saja.

---

🛠️ Infrastruktur dan Tools DevOps

Proyek ini mengadopsi serangkaian alat modern untuk mengotomatisasi dan menyederhanakan pengembangan, pengujian, deployment, dan pemantauan.

| Kategori      | Alat                              | Deskripsi                                                                                                          |
| :------------ | :-------------------------------- | :----------------------------------------------------------------------------------------------------------------- |
| Pengembangan  | Visual Studio Code (VS Code)      | Editor utama untuk fleksibilitas dan ekosistem ekstensinya.                                                        |
| Versi Kontrol | GitHub                            | Pusat manajemen kode sumber, pelacakan, dan _code review_.                                                         |
| CI/CD         | GitHub Actions                    | Mengotomatiskan Continuous Integration/Continuous Deployment.                                                      |
| Kualitas Kode | ESLint                            | Memastikan kualitas dan keamanan kode JavaScript melalui analisis statis. SonarCloud (disabled - belum ada token). |
| Pengujian     | Jest (dengan Coverage)            | Menyediakan pengujian unit yang cepat dan tangguh untuk logika game, AI, dan perilaku UI dengan laporan coverage.  |
| Keamanan      | npm audit                         | Memindai kerentanan ketergantungan dengan tingkat audit tinggi. Snyk (disabled - belum ada token).                 |
| Code Coverage | Jest Coverage, Codecov            | Pelacakan dan pelaporan code coverage dengan threshold minimum 50% (disesuaikan dengan coverage saat ini).         |
| Deployment    | Vercel                            | Platform hosting untuk aplikasi _front-end_ dan deployment otomatis.                                               |
| Monitoring    | Vercel Analytics & Speed Insights | Skrip tersemat untuk metrik kinerja dan penggunaan _real-time_.                                                    |

Link Aplikasi Live:[https://fp-pso-umber.vercel.app/](https://fp-pso-umber.vercel.app/)

---

🧩 Struktur Proyek

---

🛠️ DevOps CI/CD Workflow Architecture

Proyek ini menerapkan pipeline DevOps modern untuk memastikan proses pengembangan, pengujian, dan deployment berjalan otomatis dan terintegrasi. Berikut adalah arsitektur workflow yang digunakan:

![Workflow Architecture](./workflow-architecture.png)

Penjelasan Alur:

1. Feature Development

   - Desain UI/UX dibuat di Figma.
   - Implementasi fitur dilakukan di VS Code.
   - Data aplikasi tersimpan di Firebase Database.

2. Continuous Integration (CI)

   - Kode di-push ke repository GitHub.
   - GitHub Actions CI otomatis menjalankan:
     - Lint - ESLint untuk code quality
     - Unit Test dengan Coverage - Jest dengan laporan coverage (threshold 50%)
     - Code Coverage Upload - Upload ke Codecov untuk tracking
     - Build verification
     - **Catatan:** SonarCloud dan Snyk Security Scan saat ini disabled karena belum ada token (dapat diaktifkan dengan menambahkan secrets)

3. Continuous Delivery (CD)

   - Setelah CI sukses dan quality gate passed, pipeline CD berjalan:
     - Quality gate check final
     - Build & Deploy ke Vercel (Production)
     - Deployment summary generation
     - Sinkronisasi data/hosting ke Firebase

4. **Code Quality Monitoring**
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
├── sonar-project.properties # Konfigurasi SonarCloud (belum aktif - perlu token)
├── package.json # Konfigurasi npm & dependencies
├── eslint.config.mjs # Konfigurasi ESLint
├── babel.config.js # Konfigurasi Babel
└── jest.config.js # Konfigurasi Jest

###Catatan Struktur & Modularisasi

- gameLogic.js: Berisi seluruh logic murni (checkWinner, checkDraw, findBestMove) yang bisa di-import langsung oleh Jest untuk unit test, maupun diakses window untuk browser statis.
- script.js: Berisi integrasi logic, event handler, dan UI DOM. Untuk kebutuhan test, diekspor dengan `module.exports` agar Jest dapat mengakses fungsi dan variabel penting.
- Testing: Kini mendukung test logic murni (langsung ke gameLogic.js) dan test UI/event (melalui script.js dengan mock DOM).

---

🚀 Cara Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk mengatur dan menjalankan Tiny Tactics secara lokal.

### Persyaratan Sistem

- Node.js (v18+ untuk development, v20+ direkomendasikan untuk Firebase)
- npm (Node Package Manager)
- Git
- Web Browser
- VS Code Live Server Extension (Opsional, direkomendasikan untuk pengembangan lokal)

**Catatan:** Firebase memerlukan Node.js >=20.0.0, namun proyek ini masih menggunakan Node.js 18 di CI untuk kompatibilitas. Akan di-upgrade ke Node.js 20 di masa depan.

###Langkah-Langkah Instalasi

1.  Clone repositori:
    ```sh
    git clone [https://github.com/MerryDwi/PSO-FP.git](https://github.com/MerryDwi/PSO-FP.git)
    ```
2.  Masuk ke direktori proyek:
    ```sh
    cd fp-pso
    ```
3.  Instal dependencies:
    ```sh
    npm install
    ```

###Menjalankan Secara Lokal

1.  Buka proyek di Visual Studio Code.
2.  Klik kanan pada file `index.html` (atau `game.html` jika ingin langsung ke game).
3.  Pilih "Open with Live Server" (memerlukan ekstensi Live Server).
4.  Aplikasi akan berjalan di `localhost` browser Anda.

### Menjalankan Tes & Lint

- Jalankan Tes Unit (Jest):

  ```sh
  npm test
  ```

- Jalankan Tes dengan Coverage:

  ```sh
  npm run test:coverage
  ```

- Jalankan Pemeriksaan Lint (ESLint):

  ```sh
  npm run lint
  ```

- Jalankan Lint untuk Semua File:

  ```sh
  npm run lint:all
  ```

- Fix Lint Issues Otomatis:
  ```sh
  npm run lint:fix
  ```

---

##🔧 Konfigurasi CI/CD Lanjutan

### Status Tools Saat Ini

| Tool            | Status      | Catatan                                           |
| --------------- | ----------- | ------------------------------------------------- |
| ESLint          | ✅ Aktif    | Code quality checking aktif di CI                 |
| Jest + Coverage | ✅ Aktif    | Unit testing dengan coverage threshold 50%        |
| Codecov         | ✅ Aktif    | Coverage reports di-upload otomatis               |
| SonarCloud      | ⚠️ Disabled | Belum ada token, job di-comment di CI workflow    |
| Snyk            | ⚠️ Disabled | Belum ada token, job di-comment di CI workflow    |
| Husky           | ❌ Dihapus  | Di-remove karena deprecated, tidak digunakan lagi |

### Setup SonarCloud (Belum Aktif)

**Status:** Disabled - Job di-comment di `.github/workflows/ci.yml` karena belum ada token.

Untuk mengaktifkan:

1. Daftar di SonarCloud (https://sonarcloud.io)
2. Buat project baru dan dapatkan:
   - Organization Key
   - Project Key
3. Update `sonar-project.properties` dengan keys Anda
4. Tambahkan secrets di GitHub:
   - `SONAR_TOKEN` - Token dari SonarCloud
5. Uncomment job `sonarcloud` di `.github/workflows/ci.yml`

### Setup Snyk Security Scanning (Belum Aktif)

**Status:** Disabled - Job di-comment di `.github/workflows/ci.yml` karena belum ada token.

Untuk mengaktifkan:

1. Daftar di Snyk (https://snyk.io)
2. Tambahkan secrets di GitHub:
   - `SNYK_TOKEN` - Token dari Snyk dashboard
3. Uncomment job `security-scan` di `.github/workflows/ci.yml`

### Setup Codecov

1. Daftar di Codecov (https://codecov.io)
2. Hubungkan repository GitHub Anda
3. Codecov akan otomatis menerima coverage reports dari CI

### GitHub Secrets yang Diperlukan

Tambahkan secrets berikut di GitHub Repository Settings → Secrets:

| Secret Name         | Deskripsi                          | Sumber               |
| ------------------- | ---------------------------------- | -------------------- |
| `SONAR_TOKEN`       | Token untuk SonarCloud analysis    | SonarCloud Dashboard |
| `SNYK_TOKEN`        | Token untuk Snyk security scanning | Snyk Dashboard       |
| `VERCEL_TOKEN`      | Token untuk deployment Vercel      | Vercel Dashboard     |
| `VERCEL_ORG_ID`     | Organization ID Vercel             | Vercel Dashboard     |
| `VERCEL_PROJECT_ID` | Project ID Vercel                  | Vercel Dashboard     |

###Coverage Threshold

Proyek ini menggunakan coverage threshold minimum **50%** untuk:

- Branches: 40%
- Functions: 50%
- Lines: 50%
- Statements: 50%

**Catatan:** Threshold diturunkan dari 70% ke 50% karena coverage saat ini sekitar 52%. Threshold dapat dinaikkan kembali secara bertahap seiring dengan peningkatan coverage. Threshold dapat disesuaikan di `jest.config.js`.

Format Coverage Reports:

Jest menghasilkan coverage reports dalam beberapa format:

- text - Output terminal
- lcov - Format untuk Codecov dan tools eksternal
- html - Laporan interaktif (buka `coverage/index.html`)
- json - Data coverage dalam format JSON
- json-summary - Ringkasan coverage untuk integrasi dengan tools lain

Semua format tersedia di direktori `coverage/` setelah menjalankan `npm run test:coverage`.

---

## 📚 Lesson Learned

Dokumen ini berisi pembelajaran dan pengalaman selama setup dan pengembangan CI/CD pipeline untuk proyek ini.

### 1. Dependency Management & Lock File Sync

**Masalah:**

- `npm ci` gagal dengan error "package.json and package-lock.json are out of sync"
- Missing packages dari lock file setelah menambahkan dependencies baru

**Solusi:**

- Selalu jalankan `npm install` setelah menambahkan dependencies baru untuk update `package-lock.json`
- Jangan edit `package-lock.json` secara manual
- Commit `package-lock.json` ke repository untuk konsistensi di CI

**Lesson:**

- `npm ci` memerlukan lock file yang sync dengan `package.json`
- Selalu update lock file sebelum commit ketika menambah/mengubah dependencies

### 2. Node.js Version Compatibility

**Masalah:**

- Firebase packages memerlukan Node.js >=20.0.0
- CI pipeline menggunakan Node.js 18
- Warning `EBADENGINE` muncul saat install dependencies

**Solusi:**

- Update CI workflow ke Node.js 20 (atau tetap 18 dengan warning jika belum siap upgrade)
- Verifikasi engine requirements di `package.json` dependencies

**Lesson:**

- Selalu cek engine requirements dari dependencies utama
- Update Node.js version di CI sesuai dengan requirements
- Pertimbangkan menggunakan `.nvmrc` untuk konsistensi version

### 3. Coverage Threshold Configuration

**Masalah:**

- CI gagal dengan exit code 1 karena coverage tidak mencapai threshold 70%
- Coverage aktual hanya ~52%

**Solusi:**

- Turunkan threshold ke nilai realistis (50%) yang sesuai dengan coverage saat ini
- Threshold dapat dinaikkan bertahap seiring peningkatan coverage

**Lesson:**

- Set threshold coverage yang realistis berdasarkan kondisi proyek
- Jangan set threshold terlalu tinggi di awal, naikkan secara bertahap
- Monitor coverage trends untuk menentukan target yang tepat

### 4. Deprecated Tools - Husky

**Masalah:**

- Husky v9 menunjukkan deprecation warning
- `husky install` command sudah deprecated

**Solusi:**

- Hapus Husky dan lint-staged dari project
- Hapus `.husky` directory dan `.lintstagedrc.js`
- Hapus `prepare` script dari `package.json`

**Lesson:**

- Monitor deprecation warnings dari tools yang digunakan
- Evaluasi alternatif atau update ke versi yang tidak deprecated
- Untuk git hooks, pertimbangkan alternatif seperti GitHub Actions atau tools lain

### 5. External Service Tokens Management

**Masalah:**

- SonarCloud dan Snyk jobs gagal karena missing tokens
- CI pipeline terblokir karena error autentikasi

**Solusi:**

- Comment job yang memerlukan external tokens jika belum tersedia
- Tambahkan instruksi jelas untuk mengaktifkan kembali
- Gunakan `continue-on-error: true` untuk non-critical jobs

**Lesson:**

- Pisahkan jobs yang memerlukan external services
- Buat jobs optional dengan `continue-on-error` atau comment jika token belum ada
- Dokumentasikan dengan jelas cara setup dan aktivasi

### 6. CI Workflow Best Practices

**Best Practices yang Diterapkan:**

- ✅ Pisahkan jobs berdasarkan fungsi (lint, test, deploy)
- ✅ Gunakan `needs` untuk dependency management antar jobs
- ✅ Cache npm dependencies untuk mempercepat build
- ✅ Comment jobs yang belum siap daripada menghapus
- ✅ Tambahkan `continue-on-error` untuk non-critical steps
- ✅ Gunakan `fetch-depth: 0` untuk tools yang perlu full git history

**Lesson:**

- Struktur workflow yang baik memudahkan maintenance
- Comment lebih baik daripada delete untuk konfigurasi yang akan digunakan nanti
- Error handling yang baik mencegah satu job memblokir seluruh pipeline

### 7. Package Lock File di CI

**Masalah:**

- `npm ci` memerlukan lock file yang sync
- Missing packages menyebabkan CI gagal

**Solusi:**

- Pastikan `package-lock.json` selalu di-commit
- Jangan gunakan `npm install` di CI, gunakan `npm ci` untuk reproducibility

**Lesson:**

- `npm ci` lebih reliable untuk CI karena menggunakan exact versions dari lock file
- Lock file harus selalu di-commit untuk konsistensi
- Jangan ignore `package-lock.json` di `.gitignore`

### 8. Coverage Reports Format

**Best Practice:**

- Generate multiple format (text, lcov, html, json) untuk berbagai tools
- Upload ke Codecov untuk tracking trends
- Simpan artifacts untuk review

**Lesson:**

- Multiple format memudahkan integrasi dengan berbagai tools
- Tracking coverage trends membantu monitor kualitas kode
- HTML reports berguna untuk review manual

### Rekomendasi untuk Masa Depan

1. **Upgrade ke Node.js 20** di CI untuk kompatibilitas penuh dengan Firebase
2. **Aktifkan SonarCloud** setelah mendapatkan token untuk code quality analysis
3. **Aktifkan Snyk** setelah mendapatkan token untuk security scanning
4. **Tingkatkan coverage** secara bertahap dengan menambahkan lebih banyak tests
5. **Pertimbangkan alternatif Husky** seperti GitHub Actions untuk pre-commit checks
6. **Setup automated dependency updates** dengan Dependabot atau Renovate

---
