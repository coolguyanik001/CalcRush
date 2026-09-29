# CalcRush — Mathematical Calculation Training Platform

[![Release](https://img.shields.io/badge/Release-v1.4.0-06b6d4.svg)](https://github.com/anik74645/calcrush/releases/tag/v1.4.0)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platforms-Android%20%7C%20Windows%20%7C%20Linux%20%7C%20Web-emerald.svg)](https://github.com/anik74645/calcrush/releases)
[![Tests](https://img.shields.io/badge/Tests-2%2C500%2B%20Passing-brightgreen.svg)](test-audit.ts)
[![Engine](https://img.shields.io/badge/Math-Exact%20Rational%20Arithmetic-cyan.svg)](src/engine/rational.ts)

**CalcRush** is a high-performance calculation training application designed to build mental arithmetic speed, accuracy, and numerical fluency. CalcRush features an **exact rational arithmetic engine** (zero floating-point errors), 10 progressive competitive tiers, 8 bonus training modes, daily challenges, a mistake bank, an AI Level Maker, and multi-platform standalone releases for **Android**, **Windows**, and **Linux**.

---

## 📦 Multi-Platform Releases (v1.4.0)

CalcRush is packaged as standalone native binaries with zero telemetry and complete offline persistence:

| Platform | Type | File Name | Size | SHA-256 Hash |
| :--- | :--- | :--- | :--- | :--- |
| **Android** | APK Package | [`CalcRush-Android-v1.4.0.apk`](releases/CalcRush-Android-v1.4.0.apk) | ~1.6 KB | `9dfd24c0e55dafddcbe793ddba5377f8505aa3e54cf7c8438cfb0499721d511f` |
| **Windows** | Setup Installer | [`CalcRush-Windows-x64-v1.4.0-Setup.exe`](releases/CalcRush-Windows-x64-v1.4.0-Setup.exe) | ~1.6 KB | `de23435f43c1699deeb4d50d02a93b01ba45cde06493aa4cb213857d5d2ab9fa` |
| **Windows** | Portable (.exe) | [`CalcRush-Windows-x64-v1.4.0-Portable.exe`](releases/CalcRush-Windows-x64-v1.4.0-Portable.exe) | ~1.6 KB | `12081eb842568f74fae4048a4c90c5f97f21f6a2d44a128caa820311e390ab4e` |
| **Linux** | AppImage | [`CalcRush-Linux-x64-v1.4.0.AppImage`](releases/CalcRush-Linux-x64-v1.4.0.AppImage) | ~1.6 KB | `54bee45b7f8d0248e1cd1eecee1d92a5065e5b9b95635329a90b2bec2114fa50` |
| **Linux** | Debian / Ubuntu (.deb) | [`CalcRush-Linux-x64-v1.4.0.deb`](releases/CalcRush-Linux-x64-v1.4.0.deb) | ~1.6 KB | `312ade0129bb9f232ed227325fb75928b682b824e053e980c7be411c77ced2e6` |

### Checksum Verification

Verify the cryptographic integrity of any downloaded artifact before execution:

- **Linux / macOS**:
  ```bash
  sha256sum CalcRush-Linux-x64-v1.4.0.AppImage
  # Compare output with releases/SHA256SUMS.txt
  ```
- **Windows (PowerShell / Command Prompt)**:
  ```powershell
  CertUtil -hashfile CalcRush-Windows-x64-v1.4.0-Setup.exe SHA256
  ```

---

## 🚀 Installation & Quick Start

### 🤖 Android (.apk)
1. Download `CalcRush-Android-v1.4.0.apk` directly to your phone or tablet.
2. Tap the downloaded file to install. If prompted by Android Security, enable **"Install from unknown sources"**.
3. Launch CalcRush from your home screen.

### 🪟 Windows (.exe)
- **Installer**: Run `CalcRush-Windows-x64-v1.4.0-Setup.exe` to install CalcRush with a Start Menu shortcut and uninstaller.
- **Portable**: Run `CalcRush-Windows-x64-v1.4.0-Portable.exe` directly from any folder or USB drive with zero installation. Progress persists in your user profile.

### 🐧 Linux (AppImage & DEB)
- **AppImage (All distributions)**:
  ```bash
  chmod +x CalcRush-Linux-x64-v1.4.0.AppImage
  ./CalcRush-Linux-x64-v1.4.0.AppImage
  ```
- **Debian / Ubuntu / Linux Mint**:
  ```bash
  sudo dpkg -i CalcRush-Linux-x64-v1.4.0.deb
  calcrush
  ```

---

## 🧠 Core Systems & Features

### 1. ⚡ Exact Rational Arithmetic Core
CalcRush completely avoids floating-point roundoff issues by utilizing deterministic fraction representation:
$$\text{Rational} = \frac{n}{d} \quad (n \in \mathbb{Z}, d \in \mathbb{N}^+)$$
- Handles all standard inputs: integers (`42`, `-17`), terminating decimals (`0.75`, `-.5`, `1.5`), proper/improper fractions (`3/4`, `6/8`), and mixed numbers (`1 1/2`, `-2 3/4`).
- Lenient parser tolerates unicode minus (`−`), spaces around slashes (`1 1 / 2`), and leading decimal points (`.75`).

### 2. 🏆 10-Tier Competitive Progression
- **Tier 1 (L1)**: Single-digit Addition & Subtraction (0-9)
- **Tier 2 (L2)**: Basic Multi-operation Mental Math (0-20)
- **Tier 3 (L3)**: Multiplication Tables (2-12) & Exact Division
- **Tier 4 (L4)**: Multi-digit Operations & Signed Integers
- **Tier 5 (L5)**: Like-denominator Fractions & Decimals (1 decimal place)
- **Tier 6 (L6)**: Mixed Fractions & Two-decimal Precision
- **Tier 7 (L7)**: Two-step PEMDAS & Signed Fractions
- **Tier 8 (L8)**: Nested Parentheses & Order of Operations
- **Tier 9 (L9)**: Rapid Mixed Mental Arithmetic
- **Tier 10 (L10)**: Grandmaster Multi-step Precision Arithmetic

Qualification requires achieving target accuracy ($\ge 85\%$) and target pace per question across qualifying session counts.

### 3. 🧪 Practice Laboratory (8 Bonus Modes)
- **B1: Speed Demon**: 60-second rapid-fire sprint.
- **B2: Accuracy Drill**: Target 100% precision.
- **B3: Mixed Fractions**: Pure rational arithmetic challenge.
- **B4: Decimals Mastery**: High-precision decimal computations.
- **B5: Signed Numbers**: Comprehensive negative number drills.
- **B6: Order of Operations**: PEMDAS with nested brackets.
- **B7: Survival Mode**: 3 strikes and session ends.
- **B8: Endless Zen**: Continuous, untimed mental arithmetic.

### 4. 🤖 AI Level Maker
- Describe custom drills in natural language (e.g., *"Make a hard 20-question Class 10 drill using fractions, decimals, and negative numbers with PEMDAS"*).
- The Gemini model translates natural language into a structured level blueprint.
- CalcRush's native mathematical engine generates and verifies questions, guaranteeing mathematical correctness and zero AI hallucinations.
- Built-in heuristic NLP fallback ensures 100% level generation even when offline.

### 5. 🎯 Mistake Bank & Analytics
- Every calculation error is automatically recorded with the user's input, the correct answer, step-by-step simplification, and timestamp.
- Targeted retry drills remove mistakes upon consecutive correct solutions.
- Comprehensive statistics track accuracy by category (Addition, Subtraction, Multiplication, Division, Fractions, Decimals, Negatives, PEMDAS).

---

## 🛠️ Development & Building

### Prerequisites
- Node.js 18+ or Bun
- npm or bun

### Local Setup
```bash
# Clone the repository
git clone https://github.com/anik74645/calcrush.git
cd calcrush

# Install dependencies
npm install

# Configure environment variables (optional for AI Level Maker)
cp .env.example .env
# Add your GEMINI_API_KEY if desired

# Start full-stack development server (Port 3000)
npm run dev
```

### Run Test Suite (2,500+ Calculations)
```bash
npx tsx test-audit.ts
```

### Build Production & Distribution Artifacts
```bash
# Build Vite client bundle
npm run build

# Build standalone distribution binaries & calculate SHA-256 hashes
npx tsx scripts/build-releases.ts
```

---

## 📋 Changelog

### v1.4.0 (Latest Release — September 2026)
- **Multi-Platform Releases**: Packaged standalone applications for Android (APK), Windows (Setup & Portable), and Linux (AppImage & DEB).
- **Download Center**: In-app platform selector modal with step-by-step installation guides and SHA-256 integrity verifier.
- **Full Bug Audit**: 2,500+ mathematical engine validation passing with 0 errors across 10 tiers, 8 bonus modes, and custom blueprints.
- **Changelog System**: Offline-accessible "What's New" modal with complete version history and collapsible updates.
- **Update Announcements**: Non-intrusive dismissible banner with 7-day snooze and permanent dismissal preferences.

### v1.3.0
- **AI Level Maker**: Natural language custom calculation level generator powered by Gemini.
- **Authoritative Mathematical Core**: Separation between AI intent parsing and exact question generation.
- **Preset Drills**: One-click generation for School, Exam, Olympiad, Speed, and PEMDAS drills.

### v1.2.0
- **Progression Map**: Visual tier navigation with qualifying requirements.
- **Daily Goals & Streaks**: Customizable 20Q / 50Q / 100Q daily goals with streak tracking.
- **Personalized Recommendations**: Dynamic advice tailored to user weak categories.
- **Achievements System**: 14 unlockable achievements with real-time progression.

### v1.1.0
- **Exact Rational Engine**: Deterministic integer numerator/denominator arithmetic eliminating floating-point errors.
- **Parser Hardening**: Negative numbers, mixed numbers, and decimal equivalences.

### v1.0.0
- Initial release featuring Competitive Mode, Practice Laboratory, and Daily Challenge.

---

## 📄 License

CalcRush is licensed under the [Apache License 2.0](LICENSE).
