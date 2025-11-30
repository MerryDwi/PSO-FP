# ⚡ Quick Start: Environment Setup

Panduan cepat untuk setup environment production dan development.

## 🎯 Tujuan

Memisahkan environment production dan development dengan:

- **GitHub Branching**: `main` (production) dan `develop` (development)
- **Vercel**: 2 project terpisah untuk production dan development
- **Firebase**: 2 project terpisah untuk production dan development

## 📋 Checklist Setup

### 1. GitHub Branches (5 menit)

```bash
# Buat branch develop
git checkout main
git pull origin main
git checkout -b develop
git push -u origin develop
```

**Setup Branch Protection:**

1. GitHub → Settings → Branches
2. Add rule untuk `main`:
   - ✅ Require pull request
   - ✅ Require status checks
   - ✅ Require review (1 approval)

### 2. Firebase Projects (10 menit)

**Production (sudah ada):**

- Project: `pso-fp-aci5ba`
- Gunakan untuk production

**Development (buat baru):**

1. Firebase Console → Add Project
2. Nama: `pso-fp-dev`
3. Setup Firestore (gunakan prompt dari `GEMINI_FIREBASE_PROMPT.txt`)
4. Catat semua config values

### 3. Vercel Projects (10 menit)

**Production Project:**

1. Vercel Dashboard → Add Project
2. Import repository
3. Project Name: `pso-fp-prod`
4. Production Branch: `main`
5. Environment Variables → Production:
   ```
   VITE_FIREBASE_API_KEY=<production-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=pso-fp-aci5ba.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=pso-fp-aci5ba
   VITE_FIREBASE_STORAGE_BUCKET=pso-fp-aci5ba.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=574242918850
   VITE_FIREBASE_APP_ID=1:574242918850:web:5ab90f7ac913323867
   VITE_FIREBASE_MEASUREMENT_ID=G-JNZL6N4L3S
   VITE_ENV=production
   ```

**Development Project:**

1. Add New Project
2. Project Name: `pso-fp-dev`
3. Production Branch: `develop`
4. Environment Variables → Production:
   ```
   VITE_FIREBASE_API_KEY=<dev-api-key>
   VITE_FIREBASE_AUTH_DOMAIN=<dev-project>.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=<dev-project-id>
   VITE_FIREBASE_STORAGE_BUCKET=<dev-project>.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=<dev-sender-id>
   VITE_FIREBASE_APP_ID=<dev-app-id>
   VITE_FIREBASE_MEASUREMENT_ID=<dev-measurement-id>
   VITE_ENV=development
   ```

### 4. Local Development (2 menit)

Buat file `.env.local` (tidak di-commit):

```env
VITE_FIREBASE_API_KEY=<dev-api-key>
VITE_FIREBASE_AUTH_DOMAIN=<dev-project>.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=<dev-project-id>
VITE_FIREBASE_STORAGE_BUCKET=<dev-project>.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=<dev-sender-id>
VITE_FIREBASE_APP_ID=<dev-app-id>
VITE_FIREBASE_MEASUREMENT_ID=<dev-measurement-id>
VITE_ENV=development
```

## 🔄 Workflow

### Development

```bash
# 1. Work di feature branch
git checkout develop
git checkout -b feature/my-feature

# 2. Develop dan commit
git add .
git commit -m "feat: add feature"

# 3. Push dan create PR
git push origin feature/my-feature
# PR: feature/my-feature → develop
```

### Release to Production

```bash
# 1. Merge develop ke main via PR
# PR: develop → main

# 2. Setelah merged, main akan auto-deploy ke production
```

## ✅ Verification

1. **Check Environment:**

   - Buka browser console
   - Lihat log: `🔧 Environment: development/production`
   - Verify Firebase Project ID

2. **Test Deployments:**
   - Push ke `develop` → Check Vercel dev deployment
   - Merge ke `main` → Check Vercel prod deployment

## 📚 Dokumentasi Lengkap

- `ENVIRONMENT_SETUP.md` - Panduan lengkap
- `GITHUB_BRANCHING_GUIDE.md` - Branching strategy detail
