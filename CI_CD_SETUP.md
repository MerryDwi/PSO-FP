# 🚀 Panduan Setup CI/CD Extended

Dokumen ini menjelaskan setup lengkap untuk CI/CD pipeline yang telah diperpanjang dengan berbagai tools kualitas kode.

## 📋 Daftar Tools yang Ditambahkan

1. **SonarCloud** - Code quality analysis dan code smells detection
2. **Code Coverage** - Jest coverage dengan threshold 70%
3. **Snyk** - Security vulnerability scanning
4. **Husky** - Pre-commit dan pre-push hooks
5. **lint-staged** - Linting hanya file yang diubah
6. **Codecov** - Coverage tracking dan reporting

## 🔧 Langkah-Langkah Setup

### 1. SonarCloud Setup

#### a. Daftar dan Buat Project

1. Kunjungi https://sonarcloud.io
2. Login dengan GitHub account
3. Buat organization baru (atau gunakan yang sudah ada)
4. Import repository GitHub Anda
5. Catat **Organization Key** dan **Project Key**

#### b. Generate Token

1. Di SonarCloud, buka **My Account** → **Security**
2. Generate token baru dengan nama "GitHub Actions"
3. Copy token (hanya muncul sekali!)

#### c. Update Konfigurasi

Edit file `sonar-project.properties`:

```properties
sonar.organization=your-org-key
sonar.projectKey=your-project-key
```

#### d. Tambahkan GitHub Secret

1. Buka GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Name: `SONAR_TOKEN`
4. Value: Token dari SonarCloud
5. Klik **Add secret**

### 2. Snyk Setup

#### a. Daftar dan Connect Repository

1. Kunjungi https://snyk.io
2. Login dengan GitHub account
3. Import repository GitHub Anda
4. Snyk akan otomatis scan dependencies

#### b. Generate Token

1. Di Snyk dashboard, buka **Settings** → **Account** → **Auth Token**
2. Generate token baru
3. Copy token

#### c. Tambahkan GitHub Secret

1. Buka GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Klik **New repository secret**
3. Name: `SNYK_TOKEN`
4. Value: Token dari Snyk
5. Klik **Add secret**

### 3. Codecov Setup

#### a. Connect Repository

1. Kunjungi https://codecov.io
2. Login dengan GitHub account
3. Add repository dari GitHub
4. Codecov akan otomatis menerima coverage reports

**Note:** Tidak perlu token untuk public repositories. Untuk private repos, tambahkan `CODECOV_TOKEN` di GitHub secrets.

### 4. Husky Setup (Lokal)

Husky akan otomatis terinstall saat `npm install` karena ada script `prepare` di `package.json`.

Untuk setup manual:

```sh
npm install
npm run prepare
```

Husky akan membuat hooks di `.husky/`:

- `pre-commit`: Lint dan test sebelum commit
- `pre-push`: Lint all dan coverage sebelum push

### 5. Install Dependencies Baru

Jalankan untuk menginstall Husky dan lint-staged:

```sh
npm install
```

## ✅ Verifikasi Setup

### Test CI Pipeline

1. Buat branch baru: `git checkout -b test-ci`
2. Buat perubahan kecil di kode
3. Commit dan push: `git push origin test-ci`
4. Buka GitHub Actions tab untuk melihat pipeline berjalan

### Test Pre-commit Hook

1. Buat file dengan syntax error
2. Coba commit: `git commit -m "test"`
3. Hook akan mencegah commit jika ada error

### Test SonarCloud

1. Setelah push, tunggu CI pipeline selesai
2. Buka SonarCloud dashboard
3. Lihat analysis results

### Test Coverage

1. Jalankan: `npm run test:coverage`
2. Buka `coverage/index.html` di browser
3. Lihat coverage report detail

## 📊 Monitoring & Reports

### SonarCloud Dashboard

- **Quality Gate**: Status pass/fail
- **Bugs**: Jumlah bugs ditemukan
- **Vulnerabilities**: Security issues
- **Code Smells**: Code quality issues
- **Coverage**: Test coverage percentage

### Codecov Dashboard

- **Coverage Trend**: Grafik coverage over time
- **File Coverage**: Coverage per file
- **PR Comments**: Otomatis comment di PR dengan coverage diff

### GitHub Actions

- **CI Pipeline**: Status semua jobs
- **Artifacts**: Coverage reports dan logs
- **Workflow Runs**: History semua runs

## 🔍 Troubleshooting

### SonarCloud tidak berjalan

- ✅ Pastikan `SONAR_TOKEN` sudah ditambahkan di GitHub secrets
- ✅ Pastikan `sonar-project.properties` sudah diupdate dengan keys yang benar
- ✅ Check GitHub Actions logs untuk error messages

### Snyk scan gagal

- ✅ Pastikan `SNYK_TOKEN` sudah ditambahkan
- ✅ Token harus valid dan tidak expired
- ✅ Check Snyk dashboard untuk project status

### Husky hooks tidak jalan

- ✅ Pastikan sudah run `npm install`
- ✅ Check `.husky/` folder ada dan executable
- ✅ Run `chmod +x .husky/pre-commit .husky/pre-push`

### Coverage threshold gagal

- ✅ Pastikan coverage minimal 70% untuk semua metrics
- ✅ Run `npm run test:coverage` lokal untuk check
- ✅ Tambah tests jika coverage kurang

## 📝 Best Practices

1. **Jangan skip hooks**: Jangan gunakan `--no-verify` kecuali emergency
2. **Fix issues segera**: Fix SonarCloud issues sebelum merge
3. **Maintain coverage**: Jaga coverage di atas threshold
4. **Review security reports**: Check Snyk reports secara berkala
5. **Update dependencies**: Update npm packages untuk security patches

## 🔗 Links Penting

- [SonarCloud Documentation](https://docs.sonarcloud.io/)
- [Snyk Documentation](https://docs.snyk.io/)
- [Codecov Documentation](https://docs.codecov.com/)
- [Husky Documentation](https://typicode.github.io/husky/)
- [Jest Coverage](https://jestjs.io/docs/configuration#coveragethreshold-object)
