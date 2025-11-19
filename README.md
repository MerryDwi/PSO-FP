Tentu, saya akan menghilangkan sitasi dan merapikan kembali konten `README.md` Anda.

Berikut adalah versi yang sudah diperbarui dan dirapikan:

```markdown
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

| Kategori          | Alat                              | Deskripsi                                                                                 |
| :---------------- | :-------------------------------- | :---------------------------------------------------------------------------------------- |
| **Pengembangan**  | Visual Studio Code (VS Code)      | Editor utama untuk fleksibilitas dan ekosistem ekstensinya.                               |
| **Versi Kontrol** | GitHub                            | Pusat manajemen kode sumber, pelacakan, dan _code review_.                                |
| **CI/CD**         | GitHub Actions                    | Mengotomatiskan Continuous Integration/Continuous Deployment.                             |
| **Kualitas Kode** | ESLint                            | Memastikan kualitas dan keamanan kode JavaScript melalui analisis statis.                 |
| **Pengujian**     | Jest                              | Menyediakan pengujian unit yang cepat dan tangguh untuk logika game, AI, dan perilaku UI. |
| **Keamanan**      | npm audit                         | Memindai kerentanan ketergantungan dengan tingkat audit tinggi.                           |
| **Deployment**    | Vercel                            | Platform hosting untuk aplikasi _front-end_ dan deployment otomatis.                      |
| **Monitoring**    | Vercel Analytics & Speed Insights | Skrip tersemat untuk metrik kinerja dan penggunaan _real-time_.                           |

**Link Aplikasi Live:** [https://fp-pso-umber.vercel.app/](https://fp-pso-umber.vercel.app/)

---

## 🧩 Struktur Proyek
```

fp-pso/
├── index.html \# Halaman utama (Sign In/Sign Up)
├── game.html \# Halaman utama game X O
├── src/
│ ├── js/
│ │ └── script.js \# Logika utama game
│ │ └── auth.js \# Logika otentikasi (Sign In/Up)
│ ├── css/
│ │ └── style.css \# Gaya utama game
│ │ └── auth.css \# Gaya untuk halaman autentikasi
│ └── images/ \# Logo dan gambar
├── **tests**/
│ └── game.test.js \# Unit tests untuk logika game
├── .github/workflows/
│ ├── ci.yml \# Pipeline Continuous Integration (lint, test, audit)
│ └── cd.yml \# Pipeline Continuous Deployment (deploy ke Vercel)
├── package.json \# Konfigurasi npm & dependencies
├── eslint.config.mjs \# Konfigurasi ESLint
├── babel.config.js \# Konfigurasi Babel
└── jest.config.js \# Konfigurasi Jest

````

---

## 🚀 Cara Menjalankan Aplikasi

Ikuti langkah-langkah berikut untuk mengatur dan menjalankan Tiny Tactics secara lokal.

### Persyaratan Sistem

* **Node.js** (v18+)
* **npm** (Node Package Manager)
* **Git**
* **Web Browser**
* **VS Code Live Server Extension** (Opsional, direkomendasikan untuk pengembangan lokal)

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

* **Jalankan Tes Unit (Jest):**
    ```sh
    npm test
    ```
* **Jalankan Pemeriksaan Lint & Keamanan (ESLint):**
    ```sh
    npm run lint
    ```

---

## 👨‍💻 Dikembangkan Oleh

* Putri Salsabilla Insani
* Qoyyimil Jamilah
* Maulina Nur Laila
* Awwaliyah Aliyah

**Dokumentasi Proyek Lengkap:** [https://its.id/m/PSO-Docs-Group2](https://its.id/m/PSO-Docs-Group2)
````
