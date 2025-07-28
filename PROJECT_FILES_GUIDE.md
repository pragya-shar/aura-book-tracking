# 📋 Project Files Guide - What Every File Does

*A complete guide to understanding every file in your Aura Book Tracking project*

---

## 🚨 **CRITICAL FILES - NEVER DELETE**
*These files are essential for the app to work*

### 🏗️ **Core Application Files**
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/main.tsx` | App startup file (tells browser how to load your app) | ❌ NEVER |
| `src/App.tsx` | Main app controller (connects all pages together) | ❌ NEVER |
| `index.html` | Main webpage file (what users see first) | ❌ NEVER |
| `package.json` | Lists all tools and libraries your app needs | ❌ NEVER |
| `package-lock.json` | Exact versions of tools (keeps app stable) | ❌ NEVER |

### 🎨 **Design & Layout**
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/index.css` | Main styling (colors, fonts, layout) | ❌ NEVER |
| `tailwind.config.ts` | Design system settings | ❌ NEVER |
| `src/App.css` | Additional app styling | ❌ NEVER |

### ⚙️ **Configuration Files**
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `vite.config.ts` | Build tool settings (how app gets built) | ❌ NEVER |
| `tsconfig.json` | TypeScript settings (coding language rules) | ❌ NEVER |
| `tsconfig.app.json` | App-specific TypeScript settings | ❌ NEVER |
| `tsconfig.node.json` | Node.js TypeScript settings | ❌ NEVER |
| `components.json` | UI component settings | ❌ NEVER |
| `postcss.config.js` | CSS processing settings | ❌ NEVER |
| `eslint.config.js` | Code quality rules | ⚠️ Optional |

---

## 📄 **CORE PAGES**
*Main screens users see - Keep all of these*

| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/pages/Index.tsx` | Home page | ❌ NEVER |
| `src/pages/Library.tsx` | Your book collection page | ❌ NEVER |
| `src/pages/AddBook.tsx` | Add new books page | ❌ NEVER |
| `src/pages/ReadingProgress.tsx` | Track reading progress page | ❌ NEVER |
| `src/pages/Wallet.tsx` | Crypto wallet page (for AuraCoin rewards) | ❌ NEVER |
| `src/pages/Auth.tsx` | Login/signup page | ❌ NEVER |
| `src/pages/Statistics.tsx` | Reading stats page | ✅ Optional |
| `src/pages/NotFound.tsx` | 404 error page | ⚠️ Recommended |

---

## 🧩 **ESSENTIAL COMPONENTS**
*Reusable pieces that make pages work*

### 📚 **Book Management** (Keep All)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/BookCard.tsx` | Shows individual book info | ❌ NEVER |
| `src/components/BookDetailsDialog.tsx` | Book detail popup | ❌ NEVER |
| `src/components/BookSearch.tsx` | Search for books | ❌ NEVER |
| `src/components/BookResultCard.tsx` | Search result display | ❌ NEVER |
| `src/components/LogProgressDialog.tsx` | Log reading progress popup | ❌ NEVER |

### 🔐 **Authentication & User** (Keep All)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/auth/LoginForm.tsx` | Login form | ❌ NEVER |
| `src/components/auth/SignUpForm.tsx` | Signup form | ❌ NEVER |
| `src/components/UserInfo.tsx` | User profile display | ❌ NEVER |
| `src/components/ProtectedRoute.tsx` | Protects pages that need login | ❌ NEVER |

### 💰 **AuraCoin System (Rewards)** (Keep All)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/WalletProfileManager.tsx` | **NEW!** Links email to wallet | ❌ NEVER |
| `src/components/AuraCoinBalance.tsx` | Shows coin balance | ❌ NEVER |
| `src/components/AuraCoinTest.tsx` | Tests coin system | ⚠️ Testing only |
| `src/components/AuraCoinSystemTest.tsx` | Advanced coin testing | ⚠️ Testing only |
| `src/components/BookRewardButton.tsx` | Button to claim rewards | ❌ NEVER |

### 🔗 **Wallet Integration** (Keep All)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/WalletInfo.tsx` | Shows wallet connection status | ❌ NEVER |
| `src/components/WalletDemo.tsx` | Wallet testing tools | ⚠️ Testing only |
| `src/components/auth/FreighterWalletButton.tsx` | Connect wallet button | ❌ NEVER |

---

## 🎪 **OPTIONAL COMPONENTS**
*Visual enhancements - can be removed if needed*

### 🎨 **Visual Effects** (Safe to Delete)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/AnimatedBookshelf.tsx` | Animated book display | ✅ YES |
| `src/components/CascadingBookTitles.tsx` | Animated text effect | ✅ YES |
| `src/components/ParticleSystem.tsx` | Moving particles background | ✅ YES |
| `src/components/TypewriterText.tsx` | Typing animation effect | ✅ YES |

### 📊 **Statistics & Display** (Mostly Optional)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/LibraryStats.tsx` | Reading statistics | ⚠️ Optional |
| `src/components/ReadingFacts.tsx` | Fun reading facts | ✅ YES |
| `src/components/StarRating.tsx` | Book rating stars | ⚠️ Optional |
| `src/components/EmptyLibraryState.tsx` | When no books exist | ⚠️ Recommended |

### 📱 **User Interface** (Keep Most)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/BottomNavigation.tsx` | Bottom menu bar | ❌ NEVER |
| `src/components/SharedLayout.tsx` | Common page layout | ❌ NEVER |
| `src/components/ViewModeToggle.tsx` | Switch view modes | ⚠️ Optional |
| `src/components/InteractiveButton.tsx` | Fancy buttons | ✅ YES |

### 📷 **Camera Features** (Can Delete if Not Used)
| File | Purpose | Can Delete? |
|------|---------|-------------|
| `src/components/CameraCapture.tsx` | Take photos of books | ✅ YES |
| `src/components/ISBNBarcodeScanner.tsx` | Scan book barcodes | ✅ YES |

---

## 🔧 **BACKEND & SYSTEM FILES**

### 🗄️ **Database** (Keep All)
| Location | Purpose | Can Delete? |
|----------|---------|-------------|
| `supabase/` folder | All database files | ❌ NEVER |
| `src/integrations/supabase/` | Database connection code | ❌ NEVER |

### ⚡ **Services & Logic** (Keep All)
| Location | Purpose | Can Delete? |
|----------|---------|-------------|
| `src/services/` | Business logic (how features work) | ❌ NEVER |
| `src/contexts/` | App-wide data sharing | ❌ NEVER |
| `src/hooks/` | Reusable code snippets | ❌ NEVER |
| `src/utils/` | Helper functions | ❌ NEVER |

### 🎨 **UI Components Library** (Keep All)
| Location | Purpose | Can Delete? |
|----------|---------|-------------|
| `src/components/ui/` | Pre-built UI pieces (buttons, forms, etc.) | ❌ NEVER |

---

## 📚 **DOCUMENTATION FILES**
*Information files - can be safely removed*

| File | Purpose | Can Delete? |
|------|---------|-------------|
| `README.md` | Project description | ⚠️ Keep for reference |
| `AURACOIN_BACKEND_PLAN.md` | AuraCoin development plan | ✅ YES |
| `FREIGHTER_INTEGRATION.md` | Wallet setup guide | ✅ YES |
| `WALLET_LINKING_SETUP.md` | Wallet linking guide | ✅ YES |
| `WALLET_LOGIN_FLOW.md` | Login process guide | ✅ YES |
| `SECRET_KEY_SETUP.md` | Security setup guide | ✅ YES |
| `PROJECT_FILES_GUIDE.md` | This file | ⚠️ Keep for reference |

---

## 🗑️ **SAFE TO DELETE**

### 🏗️ **Build Files** (Auto-Generated)
| Location | Purpose | Can Delete? |
|----------|---------|-------------|
| `dist/` folder | Built app files | ✅ YES (regenerates) |
| `node_modules/` folder | Downloaded libraries | ✅ YES (reinstalls) |
| `.stellar/` folder | Stellar blockchain files | ✅ YES |

### 💰 **Experimental Features**
| Location | Purpose | Can Delete? |
|----------|---------|-------------|
| `aura-coin-scaffold/` folder | Experimental blockchain code | ✅ YES (if not using) |

### 🔧 **Development Tools**
| Location | Purpose | Can Delete? |
|----------|---------|-------------|
| `.vscode/` folder | Code editor settings | ✅ YES |
| `.git/` folder | Version control | ⚠️ Keep to save changes |
| `backup_*.sql` files | Old database backups | ✅ YES |
| `bun.lockb` | Alternative package manager | ✅ YES |

### 🖼️ **Assets**
| Location | Purpose | Can Delete? |
|----------|---------|-------------|
| `public/` folder | Images, icons, etc. | ⚠️ Check contents first |

---

## 🎯 **QUICK CLEANUP RECOMMENDATIONS**

### ✅ **Safe to Delete Right Now:**
```bash
# Documentation files (keep README.md and this guide)
AURACOIN_BACKEND_PLAN.md
FREIGHTER_INTEGRATION.md
WALLET_LINKING_SETUP.md
WALLET_LOGIN_FLOW.md
SECRET_KEY_SETUP.md

# Visual effects (if you don't want animations)
src/components/AnimatedBookshelf.tsx
src/components/CascadingBookTitles.tsx
src/components/ParticleSystem.tsx
src/components/TypewriterText.tsx
src/components/InteractiveButton.tsx
src/components/ReadingFacts.tsx

# Camera features (if not using)
src/components/CameraCapture.tsx
src/components/ISBNBarcodeScanner.tsx

# Experimental blockchain (if not using)
aura-coin-scaffold/

# Build files
dist/
.stellar/

# Backup files
backup_*.sql
```

### ⚠️ **Consider Removing:**
```bash
# Testing components (after development is complete)
src/components/AuraCoinTest.tsx
src/components/AuraCoinSystemTest.tsx
src/components/WalletDemo.tsx

# Optional features
src/components/ViewModeToggle.tsx
src/pages/Statistics.tsx
```

### ❌ **NEVER Delete:**
- Any file in `src/pages/` (except Statistics.tsx)
- Any file in `src/services/`, `src/contexts/`, `src/hooks/`, `src/utils/`
- Any configuration file (vite.config.ts, package.json, etc.)
- Core components (BookCard, UserInfo, etc.)
- Database files (`supabase/` folder)

---

## 📞 **Need Help?**

**Before deleting anything:**
1. Check if the app still works: `npm run dev`
2. Test all features you care about
3. Keep backups of anything you're unsure about

**If something breaks after deletion:**
1. Check the browser console for errors
2. Restore the deleted file
3. Ask for help identifying dependencies

---

*Last updated: {{current_date}}*
*Total files analyzed: 100+*
*Project: Aura Book Tracking App* 