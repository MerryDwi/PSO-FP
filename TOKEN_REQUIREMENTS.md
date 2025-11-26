# 🔐 Daftar Token yang Diperlukan untuk CI/CD

Dokumen ini menjelaskan semua token dan secrets yang diperlukan untuk menjalankan CI/CD pipeline dengan lengkap.

## 📊 Ringkasan Token

| Token/Secret | Status | Wajib/Opsional | Sumber |
|--------------|--------|----------------|--------|
| `GITHUB_TOKEN` | ✅ Otomatis | Otomatis | GitHub Actions (built-in) |
| `SONAR_TOKEN` | ⚠️ **BARU** | Wajib (opsional jika skip SonarCloud) | SonarCloud Dashboard |
| `SNYK_TOKEN` | ⚠️ **BARU** | Opsional | Snyk Dashboard |
| `VERCEL_TOKEN` | ✅ Sudah ada | Wajib | Vercel Dashboard |
| `VERCEL_ORG_ID` | ✅ Sudah ada | Wajib | Vercel Dashboard |
| `VERCEL_PROJECT_ID` | ✅ Sudah ada | Wajib | Vercel Dashboard |
| `CODECOV_TOKEN` | ⚠️ Opsional | Opsional (hanya untuk private repo) | Codecov Dashboard |

---

## 🆕 Token Baru yang Perlu Ditambahkan

### 1. SONAR_TOKEN (Wajib untuk SonarCloud)

**Deskripsi:** Token untuk autentikasi dengan SonarCloud untuk code quality analysis.

**Cara Mendapatkan:**
1. Kunjungi https://sonarcloud.io
2. Login dengan GitHub account
3. Buat organization baru atau gunakan yang sudah ada
4. Import repository GitHub Anda
5. Buka **My Account** → **Security**
6. Klik **Generate Token**
7. Beri nama token: `GitHub Actions`
8. **Copy token** (hanya muncul sekali!)

**Cara Menambahkan di GitHub:**
1. Buka repository → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Name: `SONAR_TOKEN`
4. Value: Paste token dari SonarCloud
5. Klik **Add secret**

**Catatan:**
- Token ini digunakan di workflow `.github/workflows/ci.yml` pada job `sonarcloud`
- Jika tidak ditambahkan, job SonarCloud akan gagal (tapi tidak memblokir pipeline karena ada `continue-on-error: true`)

---

### 2. SNYK_TOKEN (Opsional untuk Security Scanning)

**Deskripsi:** Token untuk autentikasi dengan Snyk untuk security vulnerability scanning.

**Cara Mendapatkan:**
1. Kunjungi https://snyk.io
2. Login dengan GitHub account
3. Import repository GitHub Anda
4. Buka **Settings** → **Account** → **Auth Token**
5. Klik **Generate Token** atau gunakan token yang sudah ada
6. Copy token

**Cara Menambahkan di GitHub:**
1. Buka repository → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Name: `SNYK_TOKEN`
4. Value: Paste token dari Snyk
5. Klik **Add secret**

**Catatan:**
- Token ini digunakan di workflow `.github/workflows/ci.yml` pada job `security-scan`
- Jika tidak ditambahkan, job security scan akan gagal (tapi tidak memblokir pipeline karena ada `continue-on-error: true`)
- Snyk juga bisa digunakan secara gratis untuk public repositories

---

## ✅ Token yang Sudah Ada (Dari Setup Sebelumnya)

### 3. VERCEL_TOKEN
- **Status:** Sudah ada
- **Digunakan untuk:** Deployment ke Vercel
- **Lokasi:** `.github/workflows/cd.yml`

### 4. VERCEL_ORG_ID
- **Status:** Sudah ada
- **Digunakan untuk:** Identifikasi organization Vercel
- **Lokasi:** `.github/workflows/cd.yml`

### 5. VERCEL_PROJECT_ID
- **Status:** Sudah ada
- **Digunakan untuk:** Identifikasi project Vercel
- **Lokasi:** `.github/workflows/cd.yml`

---

## 🔄 Token Otomatis (Tidak Perlu Setup)

### 6. GITHUB_TOKEN
- **Status:** Otomatis disediakan oleh GitHub Actions
- **Digunakan untuk:** Autentikasi dengan GitHub API
- **Lokasi:** `.github/workflows/ci.yml` (untuk SonarCloud integration)
- **Catatan:** Tidak perlu ditambahkan manual, GitHub Actions otomatis menyediakan

---

## 📝 Token Opsional Tambahan

### 7. CODECOV_TOKEN (Opsional)

**Kapan Diperlukan:**
- Hanya diperlukan untuk **private repositories**
- Untuk **public repositories**, Codecov tidak memerlukan token

**Cara Mendapatkan (jika diperlukan):**
1. Kunjungi https://codecov.io
2. Login dengan GitHub account
3. Add repository
4. Buka **Settings** → **General** → **Repository Upload Token**
5. Copy token

**Cara Menambahkan di GitHub (jika diperlukan):**
1. Buka repository → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Name: `CODECOV_TOKEN`
4. Value: Paste token dari Codecov
5. Klik **Add secret**

**Catatan:**
- Untuk public repositories, Codecov akan otomatis menerima coverage reports tanpa token
- Token hanya diperlukan jika repository Anda private

---

## ✅ Checklist Setup Token

Gunakan checklist ini untuk memastikan semua token sudah ditambahkan:

### Token Wajib (Minimal untuk Pipeline Berjalan)
- [ ] `VERCEL_TOKEN` - Sudah ada (dari setup sebelumnya)
- [ ] `VERCEL_ORG_ID` - Sudah ada (dari setup sebelumnya)
- [ ] `VERCEL_PROJECT_ID` - Sudah ada (dari setup sebelumnya)

### Token Baru untuk Fitur Extended
- [ ] `SONAR_TOKEN` - **PERLU DITAMBAHKAN** untuk SonarCloud analysis
- [ ] `SNYK_TOKEN` - **OPSIONAL** untuk security scanning (recommended)

### Token Opsional
- [ ] `CODECOV_TOKEN` - Hanya jika repository private

---

## 🚨 Troubleshooting

### Pipeline Gagal karena Missing Token

**Error:** `SONAR_TOKEN not found`
- **Solusi:** Tambahkan `SONAR_TOKEN` di GitHub Secrets
- **Alternatif:** Job akan skip jika token tidak ada (karena `continue-on-error: true`)

**Error:** `SNYK_TOKEN not found`
- **Solusi:** Tambahkan `SNYK_TOKEN` di GitHub Secrets
- **Alternatif:** Job akan skip jika token tidak ada (karena `continue-on-error: true`)

**Error:** `VERCEL_TOKEN not found`
- **Solusi:** Pastikan token Vercel sudah ditambahkan
- **Catatan:** Token ini wajib untuk deployment

### Verifikasi Token

Untuk memverifikasi token sudah benar:
1. Buka **Actions** tab di GitHub repository
2. Jalankan workflow manual atau push commit
3. Check logs untuk error autentikasi
4. Jika ada error, pastikan token sudah benar dan tidak expired

---

## 📚 Referensi

- [GitHub Secrets Documentation](https://docs.github.com/en/actions/security-guides/encrypted-secrets)
- [SonarCloud Authentication](https://docs.sonarcloud.io/getting-started/github/)
- [Snyk Authentication](https://docs.snyk.io/integrations/ci-cd-integrations/github-actions-integration)
- [Codecov Setup](https://docs.codecov.com/docs)

---

## 💡 Tips

1. **Naming Convention:** Gunakan nama token yang jelas dan konsisten
2. **Security:** Jangan pernah commit token ke repository
3. **Rotation:** Rotate token secara berkala untuk keamanan
4. **Documentation:** Catat kapan token dibuat dan expired date (jika ada)
5. **Team Access:** Pastikan semua anggota tim tahu token mana yang diperlukan

