# 🌿 GitHub Branching Strategy Guide

Panduan lengkap untuk branching strategy dengan GitHub untuk memisahkan production dan development.

## 📋 Branch Structure

```
main (production)
  │
  ├── develop (development/staging)
  │     │
  │     ├── feature/add-leaderboard
  │     ├── feature/improve-ui
  │     └── bugfix/fix-auth-issue
  │
  └── hotfix/critical-bug (emergency fixes)
```

## 🔀 Branch Types

### 1. `main` - Production Branch

- **Purpose**: Production-ready code
- **Protection**: ✅ Required
- **Deployment**: Production environment (Vercel)
- **Merge Source**: Hanya dari `develop` atau `hotfix/*`

**Rules:**

- ❌ No direct commits
- ✅ Only merge via Pull Request
- ✅ Require code review
- ✅ Require CI checks to pass
- ✅ Require branch to be up to date

### 2. `develop` - Development Branch

- **Purpose**: Integration branch untuk development
- **Protection**: ✅ Recommended
- **Deployment**: Development/staging environment (Vercel)
- **Merge Source**: Dari `feature/*` atau `bugfix/*`

**Rules:**

- ✅ Allow direct commits (optional, tergantung team)
- ✅ Require CI checks to pass
- ✅ Code review recommended

### 3. `feature/*` - Feature Branches

- **Purpose**: Development fitur baru
- **Naming**: `feature/feature-name` (kebab-case)
- **Source**: Branch dari `develop`
- **Merge**: Back ke `develop` via PR

**Examples:**

- `feature/add-leaderboard`
- `feature/improve-game-ui`
- `feature/add-dark-mode`

### 4. `bugfix/*` - Bug Fix Branches

- **Purpose**: Fix bugs yang ditemukan di develop
- **Naming**: `bugfix/bug-description`
- **Source**: Branch dari `develop`
- **Merge**: Back ke `develop` via PR

**Examples:**

- `bugfix/fix-auth-error`
- `bugfix/fix-score-calculation`

### 5. `hotfix/*` - Hotfix Branches

- **Purpose**: Critical fixes untuk production
- **Naming**: `hotfix/issue-description`
- **Source**: Branch dari `main`
- **Merge**: Ke `main` dan `develop`

**Examples:**

- `hotfix/fix-security-vulnerability`
- `hotfix/fix-critical-crash`

## 🔧 Setup Branch Protection

### 1. Setup Main Branch Protection

1. Buka repository → **Settings** → **Branches**
2. Klik **Add rule** atau edit existing rule untuk `main`
3. Configure:

   ```
   Branch name pattern: main

   ✅ Require a pull request before merging
      - Required approvals: 1
      - Dismiss stale pull request approvals when new commits are pushed
      - Require review from Code Owners

   ✅ Require status checks to pass before merging
      - Require branches to be up to date before merging
      - Status checks: (pilih semua CI checks)
        - lint
        - test
        - coverage
        - build

   ✅ Require conversation resolution before merging

   ✅ Include administrators
   ```

### 2. Setup Develop Branch Protection

1. Add rule untuk `develop`:

   ```
   Branch name pattern: develop

   ✅ Require status checks to pass before merging
      - Require branches to be up to date before merging
      - Status checks: (pilih CI checks)
        - lint
        - test

   ⚠️ Require a pull request before merging (optional)
      - Required approvals: 1 (optional)

   ❌ Do not include administrators (optional)
   ```

## 🔄 Workflow Examples

### Feature Development Workflow

```bash
# 1. Start dari develop
git checkout develop
git pull origin develop

# 2. Create feature branch
git checkout -b feature/add-new-feature

# 3. Develop dan commit
git add .
git commit -m "feat: add new feature"

# 4. Push feature branch
git push origin feature/add-new-feature

# 5. Create Pull Request di GitHub
# feature/add-new-feature → develop

# 6. Setelah PR approved dan merged
git checkout develop
git pull origin develop
git branch -d feature/add-new-feature  # Delete local branch
```

### Hotfix Workflow

```bash
# 1. Start dari main
git checkout main
git pull origin main

# 2. Create hotfix branch
git checkout -b hotfix/critical-fix

# 3. Fix dan commit
git add .
git commit -m "fix: critical security fix"

# 4. Push hotfix
git push origin hotfix/critical-fix

# 5. Create PR ke main
# hotfix/critical-fix → main

# 6. Setelah merged ke main, merge juga ke develop
git checkout develop
git pull origin develop
git merge main  # atau create PR
git push origin develop
```

### Release to Production Workflow

```bash
# 1. Pastikan develop sudah stable
git checkout develop
git pull origin develop

# 2. Create PR ke main
# develop → main (via GitHub UI)

# 3. Setelah PR approved dan merged
git checkout main
git pull origin main

# 4. Tag release (optional)
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0
```

## 📝 Commit Message Convention

Gunakan [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(leaderboard): add top 10 leaderboard display
fix(auth): fix login error on mobile devices
docs(readme): update setup instructions
refactor(firestore): improve CRUD operations
```

## 🏷️ Tagging Strategy

### Semantic Versioning

```
v<major>.<minor>.<patch>
```

- **Major**: Breaking changes
- **Minor**: New features (backward compatible)
- **Patch**: Bug fixes

**Examples:**

- `v1.0.0` - Initial release
- `v1.1.0` - Add new feature
- `v1.1.1` - Bug fix
- `v2.0.0` - Major update with breaking changes

### Create Tag

```bash
# Create annotated tag
git tag -a v1.0.0 -m "Release version 1.0.0"

# Push tag
git push origin v1.0.0

# Push all tags
git push origin --tags
```

## 🔍 Branch Naming Best Practices

### ✅ Good Names

- `feature/add-user-profile`
- `feature/implement-dark-mode`
- `bugfix/fix-score-calculation`
- `hotfix/fix-security-issue`
- `refactor/improve-firestore-crud`

### ❌ Bad Names

- `feature1` (tidak deskriptif)
- `fix` (tidak jelas fix apa)
- `new-feature` (tidak spesifik)
- `test` (bisa conflict dengan test branch)
- `update` (terlalu generic)

## 🚀 GitHub Actions Integration

### Branch-based Workflows

GitHub Actions akan otomatis detect branch dan run workflows sesuai:

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run tests
        run: npm test
```

## 📊 Branch Comparison

| Aspect         | main        | develop        | feature/\*     |
| -------------- | ----------- | -------------- | -------------- |
| Stability      | ✅ Stable   | ⚠️ Testing     | 🔧 WIP         |
| Deployment     | Production  | Staging        | Preview        |
| Direct Commits | ❌ No       | ⚠️ Optional    | ✅ Yes         |
| PR Required    | ✅ Yes      | ⚠️ Optional    | ✅ Yes         |
| Code Review    | ✅ Required | ⚠️ Recommended | ⚠️ Recommended |

## ✅ Checklist

- [ ] Branch `develop` sudah dibuat
- [ ] Branch protection untuk `main` sudah di-set
- [ ] Branch protection untuk `develop` sudah di-set
- [ ] Team sudah memahami workflow
- [ ] Commit message convention sudah disepakati
- [ ] Tagging strategy sudah ditentukan
- [ ] GitHub Actions workflows sudah dikonfigurasi
- [ ] Documentation sudah di-update

## 🔗 Resources

- [GitHub Branch Protection](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches)
- [Git Flow](https://www.atlassian.com/git/tutorials/comparing-workflows/gitflow-workflow)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Semantic Versioning](https://semver.org/)
