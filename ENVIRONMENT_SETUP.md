# 🚀 Environment Setup: Production & Development

Panduan lengkap untuk memisahkan environment production dan development menggunakan Vercel dan GitHub branching.

## 📋 Overview

### Branching Strategy

```
main (production)
  └── develop (development/staging)
      └── feature/* (feature branches)
```

- **`main`**: Production environment, hanya merge dari `develop` setelah testing
- **`develop`**: Development/staging environment untuk testing
- **`feature/*`**: Feature branches untuk development

### Environment Mapping

| Branch      | Environment | Vercel Project | Firebase Project                 |
| ----------- | ----------- | -------------- | -------------------------------- |
| `main`      | Production  | `pso-fp-prod`  | `pso-fp-aci5ba` (production)     |
| `develop`   | Development | `pso-fp-dev`   | `pso-fp-dev-xxxxx` (development) |
| `feature/*` | Preview     | Auto preview   | Development project              |

## 🔧 Setup Steps

### 1. GitHub Branching Setup

#### a. Buat Branch `develop`

```bash
# Dari main branch
git checkout main
git pull origin main

# Buat dan switch ke develop
git checkout -b develop
git push -u origin develop
```

#### b. Set Default Branch Protection

1. Buka GitHub repository → **Settings** → **Branches**
2. Add rule untuk `main`:
   - ✅ Require pull request reviews
   - ✅ Require status checks to pass
   - ✅ Require branches to be up to date
   - ✅ Include administrators
3. Add rule untuk `develop`:
   - ✅ Require pull request reviews (optional)
   - ✅ Require status checks to pass

### 2. Firebase Project Setup

#### a. Buat Firebase Project untuk Development

1. Buka [Firebase Console](https://console.firebase.google.com/)
2. Klik **Add project**
3. Nama: `pso-fp-dev` (atau sesuai kebutuhan)
4. Setup Firestore database (gunakan prompt dari `GEMINI_FIREBASE_PROMPT.txt`)
5. Catat konfigurasi Firebase untuk development

#### b. Konfigurasi Firebase untuk Production

- Project: `pso-fp-aci5ba` (sudah ada)
- Pastikan security rules sudah dikonfigurasi dengan benar

### 3. Environment Variables Setup

#### a. Buat File `.env.example`

File template untuk environment variables (commit ke repo):

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=

# Environment
VITE_ENV=development
```

#### b. Buat File `.env.local` (untuk local development)

File ini **TIDAK** di-commit ke repo (sudah di `.gitignore`):

```env
# Development Firebase Configuration
VITE_FIREBASE_API_KEY=your-dev-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-dev-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-dev-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-dev-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-dev-sender-id
VITE_FIREBASE_APP_ID=your-dev-app-id
VITE_FIREBASE_MEASUREMENT_ID=your-dev-measurement-id

# Environment
VITE_ENV=development
```

### 4. Update Firebase Config untuk Support Environment Variables

Update `src/js/firebase.config.js` untuk menggunakan environment variables:

```javascript
// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

// Get environment variables with fallback to production
const getFirebaseConfig = () => {
  // Check if we're in browser environment
  if (typeof window === "undefined") {
    // Node.js environment (testing)
    return {
      apiKey:
        process.env.VITE_FIREBASE_API_KEY ||
        "AIzaSyCXw-mEwyjH9qA5W8jM5W3zSwbXqMhRk",
      authDomain:
        process.env.VITE_FIREBASE_AUTH_DOMAIN ||
        "pso-fp-aci5ba.firebaseapp.com",
      projectId: process.env.VITE_FIREBASE_PROJECT_ID || "pso-fp-aci5ba",
      storageBucket:
        process.env.VITE_FIREBASE_STORAGE_BUCKET || "pso-fp-aci5ba.appspot.com",
      messagingSenderId:
        process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "574242918850",
      appId:
        process.env.VITE_FIREBASE_APP_ID ||
        "1:574242918850:web:5ab90f7ac913323867",
      measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || "G-JNZL6N4L3S",
    };
  }

  // Browser environment - use import.meta.env (Vite) or window.env
  const env =
    import.meta?.env || (typeof window !== "undefined" && window.env) || {};

  return {
    apiKey:
      env.VITE_FIREBASE_API_KEY ||
      import.meta?.env?.VITE_FIREBASE_API_KEY ||
      "AIzaSyCXw-mEwyjH9qA5W8jM5W3zSwbXqMhRk",
    authDomain:
      env.VITE_FIREBASE_AUTH_DOMAIN ||
      import.meta?.env?.VITE_FIREBASE_AUTH_DOMAIN ||
      "pso-fp-aci5ba.firebaseapp.com",
    projectId:
      env.VITE_FIREBASE_PROJECT_ID ||
      import.meta?.env?.VITE_FIREBASE_PROJECT_ID ||
      "pso-fp-aci5ba",
    storageBucket:
      env.VITE_FIREBASE_STORAGE_BUCKET ||
      import.meta?.env?.VITE_FIREBASE_STORAGE_BUCKET ||
      "pso-fp-aci5ba.appspot.com",
    messagingSenderId:
      env.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      import.meta?.env?.VITE_FIREBASE_MESSAGING_SENDER_ID ||
      "574242918850",
    appId:
      env.VITE_FIREBASE_APP_ID ||
      import.meta?.env?.VITE_FIREBASE_APP_ID ||
      "1:574242918850:web:5ab90f7ac913323867",
    measurementId:
      env.VITE_FIREBASE_MEASUREMENT_ID ||
      import.meta?.env?.VITE_FIREBASE_MEASUREMENT_ID ||
      "G-JNZL6N4L3S",
  };
};

export const firebaseConfig = getFirebaseConfig();

// Get current environment
export const getEnvironment = () => {
  if (typeof window === "undefined") {
    return process.env.VITE_ENV || "development";
  }
  const env =
    import.meta?.env || (typeof window !== "undefined" && window.env) || {};
  return env.VITE_ENV || import.meta?.env?.VITE_ENV || "development";
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

// Export app dan analytics untuk penggunaan di file lain
export { app, analytics };
```

**Note**: Jika tidak menggunakan Vite, sesuaikan dengan build tool yang digunakan.

### 5. Vercel Setup

#### a. Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

#### b. Setup Vercel Projects

**Production Project (main branch):**

1. Buka [Vercel Dashboard](https://vercel.com/dashboard)
2. Klik **Add New Project**
3. Import repository GitHub
4. Project Name: `pso-fp-prod`
5. Framework Preset: **Other** (atau sesuai)
6. Root Directory: `.` (root)
7. Build Command: (kosongkan jika static)
8. Output Directory: `.` (root)
9. Install Command: `npm install`
10. Environment Variables:
    - Tambahkan semua Firebase config untuk **production**
    - `VITE_ENV=production`

**Development Project (develop branch):**

1. Buat project baru di Vercel
2. Project Name: `pso-fp-dev`
3. Connect ke repository yang sama
4. Production Branch: `develop`
5. Environment Variables:
   - Tambahkan semua Firebase config untuk **development**
   - `VITE_ENV=development`

#### c. Setup Environment Variables di Vercel

**Untuk Production Project:**

1. Buka project → **Settings** → **Environment Variables**
2. Tambahkan variables untuk **Production** environment:
   ```
   VITE_FIREBASE_API_KEY=production-api-key
   VITE_FIREBASE_AUTH_DOMAIN=production-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=production-project-id
   VITE_FIREBASE_STORAGE_BUCKET=production-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=production-sender-id
   VITE_FIREBASE_APP_ID=production-app-id
   VITE_FIREBASE_MEASUREMENT_ID=production-measurement-id
   VITE_ENV=production
   ```

**Untuk Development Project:**

1. Buka project → **Settings** → **Environment Variables**
2. Tambahkan variables untuk **Production** environment (karena develop branch = production di project dev):
   ```
   VITE_FIREBASE_API_KEY=dev-api-key
   VITE_FIREBASE_AUTH_DOMAIN=dev-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=dev-project-id
   VITE_FIREBASE_STORAGE_BUCKET=dev-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=dev-sender-id
   VITE_FIREBASE_APP_ID=dev-app-id
   VITE_FIREBASE_MEASUREMENT_ID=dev-measurement-id
   VITE_ENV=development
   ```

**Preview Deployments (feature branches):**

- Otomatis menggunakan environment variables dari Development project
- Atau bisa setup khusus untuk Preview environment

### 6. Vercel Configuration File

Buat file `vercel.json` di root project:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ],
  "env": {
    "VITE_ENV": "@vite_env"
  }
}
```

### 7. Update .gitignore

Pastikan file `.gitignore` sudah include:

```gitignore
# Environment variables
.env
.env.local
.env.*.local
.env.development
.env.production

# Vercel
.vercel

# Dependencies
node_modules/

# Build outputs
dist/
build/

# Coverage
coverage/

# Logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# OS
.DS_Store
Thumbs.db
```

## 🔄 Workflow

### Development Workflow

1. **Buat Feature Branch dari develop:**

   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/my-feature
   ```

2. **Development:**

   - Work di feature branch
   - Test lokal dengan `.env.local`
   - Commit changes

3. **Push dan Create PR:**

   ```bash
   git push origin feature/my-feature
   ```

   - Vercel akan otomatis create preview deployment
   - Test di preview URL

4. **Merge ke develop:**

   - Create PR: `feature/my-feature` → `develop`
   - Review dan approve
   - Merge ke develop
   - Vercel akan deploy ke development environment

5. **Merge ke main (Production):**
   - Setelah testing di develop
   - Create PR: `develop` → `main`
   - Review dan approve
   - Merge ke main
   - Vercel akan deploy ke production environment

### Deployment Flow

```
feature branch → Preview Deployment (Vercel)
     ↓
develop branch → Development Deployment (Vercel)
     ↓
main branch → Production Deployment (Vercel)
```

## ✅ Verification

### Check Environment di Runtime

Tambahkan helper function untuk check environment:

```javascript
// src/js/utils/environment.js
export const getEnvironment = () => {
  if (typeof window === "undefined") {
    return process.env.VITE_ENV || "development";
  }
  const env = import.meta?.env || window.env || {};
  return env.VITE_ENV || "development";
};

export const isProduction = () => {
  return getEnvironment() === "production";
};

export const isDevelopment = () => {
  return getEnvironment() === "development";
};

// Log environment (hanya di development)
if (isDevelopment()) {
  console.log("🔧 Running in DEVELOPMENT mode");
  console.log("Firebase Project:", firebaseConfig.projectId);
}
```

### Test Environment Separation

1. **Local Development:**

   ```bash
   # Set .env.local dengan dev config
   npm run serve
   # Check console untuk environment
   ```

2. **Development Deployment:**

   - Push ke `develop` branch
   - Check Vercel deployment
   - Verify Firebase project ID di console

3. **Production Deployment:**
   - Merge `develop` ke `main`
   - Check Vercel deployment
   - Verify Firebase project ID di console

## 🔒 Security Best Practices

1. **Never commit secrets:**

   - ✅ Gunakan `.env.example` sebagai template
   - ✅ Pastikan `.env.local` di `.gitignore`
   - ✅ Gunakan Vercel Environment Variables

2. **Separate Firebase Projects:**

   - ✅ Production dan Development harus berbeda
   - ✅ Development project bisa di-reset tanpa masalah
   - ✅ Production project dengan security rules ketat

3. **Branch Protection:**

   - ✅ Require PR reviews untuk `main`
   - ✅ Require status checks
   - ✅ No direct push ke `main`

4. **Environment Variables:**
   - ✅ Gunakan Vercel secrets untuk sensitive data
   - ✅ Rotate keys secara berkala
   - ✅ Monitor access logs

## 📊 Monitoring

### Vercel Analytics

- Monitor deployments per environment
- Check build logs
- Monitor performance metrics

### Firebase Console

- Monitor usage per project
- Check Firestore usage
- Monitor authentication logs

## 🔍 Troubleshooting

### Environment variables tidak ter-load

- ✅ Pastikan prefix `VITE_` untuk Vite projects
- ✅ Restart dev server setelah update `.env.local`
- ✅ Check Vercel environment variables sudah di-set

### Wrong Firebase project digunakan

- ✅ Check environment variable `VITE_FIREBASE_PROJECT_ID`
- ✅ Verify di browser console
- ✅ Check Vercel deployment logs

### Preview deployments menggunakan wrong config

- ✅ Check Vercel project settings
- ✅ Verify environment variables untuk Preview
- ✅ Check branch mapping di Vercel

## 📝 Checklist

- [ ] Branch `develop` sudah dibuat
- [ ] Branch protection rules sudah di-set
- [ ] Firebase development project sudah dibuat
- [ ] `.env.example` sudah dibuat
- [ ] `.env.local` sudah dibuat (local only)
- [ ] `firebase.config.js` sudah di-update untuk env vars
- [ ] Vercel production project sudah setup
- [ ] Vercel development project sudah setup
- [ ] Environment variables sudah di-set di Vercel
- [ ] `.gitignore` sudah include `.env*` files
- [ ] Test deployment untuk develop branch
- [ ] Test deployment untuk main branch
- [ ] Verify environment separation bekerja

## 🔗 Resources

- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Firebase Multiple Projects](https://firebase.google.com/docs/projects/multiprojects)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
