# CalcRush — Mathematical Calculation Training Platform

[![Release](https://img.shields.io/badge/Release-v1.4.1-06b6d4.svg)](https://github.com/anik74645/calcrush/releases/tag/v1.4.1)
[![License](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](LICENSE)
[![Platform](https://img.shields.io/badge/Platforms-Windows%20%7C%20Linux%20%7C%20Android%20(PWA)%20%7C%20Web-emerald.svg)](https://github.com/anik74645/calcrush/releases)
[![Tests](https://img.shields.io/badge/Tests-2%2C500%2B%20Passing-brightgreen.svg)](test-audit.ts)
[![Engine](https://img.shields.io/badge/Math-Exact%20Rational%20Arithmetic-cyan.svg)](src/engine/rational.ts)

**CalcRush** is a high-performance calculation training application designed to build mental arithmetic speed, accuracy, and numerical fluency. CalcRush features an **exact rational arithmetic engine** (zero floating-point errors), 10 progressive competitive tiers, 8 bonus training modes, daily challenges, a mistake bank, an AI Level Maker, genuine compiled native standalone binaries for **Windows** and **Linux**, and native-grade **Progressive Web App (PWA)** installations for Android and macOS.

---

## 📦 Multi-Platform Releases (v1.4.1)

CalcRush v1.4.1 provides genuine compiled desktop executables and system packages with zero telemetry and full offline persistence:

| Platform | Type | File Name | Size | SHA-256 Hash | Status |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Windows** | Setup PE32+ (.exe) | [`CalcRush-Windows-x64-v1.4.1-Setup.exe`](releases/CalcRush-Windows-x64-v1.4.1-Setup.exe) | 84.7 MB | `2579d218ed221c35782fedbc38fa889a319c6dd815bef67919a938c1b4bf071e` | **Genuine PE32+ Executable** |
| **Windows** | Portable PE32+ (.exe) | [`CalcRush-Windows-x64-v1.4.1-Portable.exe`](releases/CalcRush-Windows-x64-v1.4.1-Portable.exe) | 84.7 MB | `c43c2c66f647062efe645d3599a222484599c99ac76c5e018655ea4eb089b498` | **Genuine PE32+ Executable** |
| **Linux** | AppImage / ELF (.AppImage) | [`CalcRush-Linux-x64-v1.4.1.AppImage`](releases/CalcRush-Linux-x64-v1.4.1.AppImage) | 78.7 MB | `e6bfb23df53a188bc811592e1c5e43712e883e6e06dcfbbb9e66782d85b04cb6` | **Genuine 64-bit ELF** |
| **Linux** | Debian / Ubuntu (.deb) | [`CalcRush-Linux-x64-v1.4.1.deb`](releases/CalcRush-Linux-x64-v1.4.1.deb) | 160 KB | `e2b0cded854cd6567834930fa0fc4f67ded9071c12e3cb86b3389795beedba67` | **Genuine Debian Package** |
| **Android** | Installable PWA | *Installed via Chrome / Chromium* | — | `INSTALLED_VIA_BROWSER` | **Verified Mobile PWA** |
| **macOS** | Installable PWA | *Installed via Safari / Chrome* | — | `INSTALLED_VIA_BROWSER` | **Verified Desktop PWA** |

### Checksum Verification

Verify the cryptographic integrity of any downloaded artifact before execution:

- **Linux / macOS**:
  ```bash
  sha256sum CalcRush-Linux-x64-v1.4.1.AppImage
  # Compare output with releases/SHA256SUMS.txt
  ```
- **Windows (PowerShell / Command Prompt)**:
  ```powershell
  CertUtil -hashfile CalcRush-Windows-x64-v1.4.1-Setup.exe SHA256
  ```

---

## 🚀 Installation & Quick Start

### 🪟 Windows (PE32+ Executable)
- **Setup**: Run `CalcRush-Windows-x64-v1.4.1-Setup.exe` to launch the standalone local calculation runtime.
- **Portable**: Run `CalcRush-Windows-x64-v1.4.1-Portable.exe` directly from any folder or USB drive with zero installation. Progress persists in your local profile.

### 🐧 Linux (AppImage & Debian Package)
- **Debian / Ubuntu / Linux Mint (.deb)**:
  ```bash
  sudo dpkg -i CalcRush-Linux-x64-v1.4.1.deb
  calcrush
  ```
- **AppImage / Standalone Executable (All distributions)**:
  ```bash
  chmod +x CalcRush-Linux-x64-v1.4.1.AppImage
  ./CalcRush-Linux-x64-v1.4.1.AppImage
  ```

### 🤖 Android (Installable PWA)
1. Open CalcRush in Chrome or any modern mobile browser.
2. Tap the browser menu (⋮) and tap **"Install app"** or **"Add to Home screen"**.
3. CalcRush launches as a dedicated fullscreen mobile application with haptic feedback, custom touch keypad, and offline persistence.
4. *(Note: A native wrapped APK requires an Android SDK / Gradle build environment and is in development for future releases).*

### 🍎 macOS (Desktop PWA)
1. Open CalcRush in Safari or Chrome on macOS.
2. In Safari: Click **File → Add to Dock**. In Chrome: Click the **Install** icon in the address bar.
3. CalcRush runs as a standalone desktop window with native dock integration and offline support.

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
- Node.js 20+ or Bun
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

## 📋 Changelog Highlights

### v1.4.1 (Current Hotfix — September 2026)
- **Genuine Native Binaries**: Replaced invalid placeholder artifacts with real compiled Windows PE32+ executables (85 MB) and Linux 64-bit ELF standalone executables (79 MB).
- **Debian Binary Package**: Validated genuine Debian package (160 KB) built with dpkg-deb including desktop launcher and system menu integration.
- **Cryptographic Verification**: Re-hashed and regenerated fresh SHA-256 checksums matching byte-for-byte with local distribution packages.
- **Honest Platform Labeling**: Accurately labeled macOS and mobile Android browser home screen installations as high-performance PWAs rather than misleading binary downloads.
- **Keypad Input Polish**: Refined keypad negative minus input handling for negative mixed fractions and spacing.

### v1.4.0
- Multi-Platform Release, Bug Audit & In-App Changelog System.

---

## 📄 License

CalcRush is licensed under the [Apache License 2.0](LICENSE).
